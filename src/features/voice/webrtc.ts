import type { AnuncioVoz, SenalVoz } from "@/services/socket";

/**
 * Malla de voz WebRTC P2P (audio directo navegador<->navegador, cifrado DTLS-SRTP).
 * El backend SOLO retransmite la senalizacion (offers/answers/ICE) por STOMP; el audio
 * nunca pasa por el servidor. Topologia mesh: valida para salas de 2-10 jugadores con
 * pocos hablando a la vez (documentado como limite conocido; un SFU seria la evolucion v2).
 *
 * Protocolo anti-glare: al recibir el anuncio "presente" de un par, solo el lado con
 * userId lexicograficamente MENOR crea la oferta; el mayor responde con una senal
 * dirigida "presente" para que el menor sepa de el y oferte. Nunca ofertan ambos.
 */

export interface ParticipanteVoz {
  userId: string;
  username: string;
  hablando: boolean;
  /** Silenciado localmente por MI (no afecta a los demas). */
  silenciado: boolean;
}

export interface OpcionesMalla {
  miUserId: string;
  anunciar: (tipo: "presente" | "salida") => void;
  enviarSenal: (objetivoUserId: string, tipo: string, datos: string) => void;
  onParticipantes: (participantes: ParticipanteVoz[]) => void;
  onError: (mensaje: string) => void;
}

export interface MallaVoz {
  activar: () => Promise<boolean>;
  desactivar: () => void;
  alternarMicrofono: () => boolean;
  silenciarPeer: (userId: string, silenciado: boolean) => void;
  manejarAnuncio: (anuncio: AnuncioVoz) => void;
  manejarSenal: (senal: SenalVoz) => void;
  estaActiva: () => boolean;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const UMBRAL_HABLANDO = 18; // promedio de frecuencias (0-255) sobre el que se considera voz

interface Peer {
  userId: string;
  username: string;
  pc: RTCPeerConnection;
  audio: HTMLAudioElement | null;
  analizador: AnalyserNode | null;
  candidatosPendientes: RTCIceCandidateInit[];
  remotaLista: boolean;
  silenciado: boolean;
  hablando: boolean;
}

export function crearMallaVoz(opciones: OpcionesMalla): MallaVoz {
  const { miUserId, anunciar, enviarSenal, onParticipantes, onError } = opciones;

  let streamLocal: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analizadorLocal: AnalyserNode | null = null;
  let intervaloVad: number | null = null;
  const peers = new Map<string, Peer>();

  const activa = () => streamLocal !== null;

  function publicarParticipantes() {
    const lista: ParticipanteVoz[] = [...peers.values()].map((p) => ({
      userId: p.userId,
      username: p.username,
      hablando: p.hablando,
      silenciado: p.silenciado,
    }));
    onParticipantes(lista);
  }

  function nivelDe(analizador: AnalyserNode): number {
    const datos = new Uint8Array(analizador.frequencyBinCount);
    analizador.getByteFrequencyData(datos);
    let suma = 0;
    for (const v of datos) suma += v;
    return suma / datos.length;
  }

  function iniciarVad() {
    if (intervaloVad !== null) return;
    intervaloVad = window.setInterval(() => {
      let cambio = false;
      for (const p of peers.values()) {
        const hablando = p.analizador !== null && !p.silenciado && nivelDe(p.analizador) > UMBRAL_HABLANDO;
        if (hablando !== p.hablando) {
          p.hablando = hablando;
          cambio = true;
        }
      }
      if (cambio) publicarParticipantes();
    }, 300);
  }

  function conectarAnalizador(stream: MediaStream): AnalyserNode | null {
    try {
      audioContext = audioContext ?? new AudioContext();
      const fuente = audioContext.createMediaStreamSource(stream);
      const analizador = audioContext.createAnalyser();
      analizador.fftSize = 256;
      fuente.connect(analizador); // solo analisis: no se conecta a la salida (sin eco)
      return analizador;
    } catch {
      return null;
    }
  }

  function crearPeer(userId: string, username: string): Peer {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    const peer: Peer = {
      userId,
      username,
      pc,
      audio: null,
      analizador: null,
      candidatosPendientes: [],
      remotaLista: false,
      silenciado: false,
      hablando: false,
    };

    streamLocal?.getTracks().forEach((t) => pc.addTrack(t, streamLocal as MediaStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) enviarSenal(userId, "ice", JSON.stringify(e.candidate.toJSON()));
    };
    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      const audio = new Audio();
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.muted = peer.silenciado;
      audio.play().catch(() => {
        /* el gesto de "Activar voz" ya habilito la reproduccion; ignorar */
      });
      peer.audio = audio;
      peer.analizador = conectarAnalizador(stream);
      publicarParticipantes();
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        quitarPeer(userId);
      }
    };

    peers.set(userId, peer);
    return peer;
  }

  function quitarPeer(userId: string) {
    const peer = peers.get(userId);
    if (!peer) return;
    peer.pc.onicecandidate = null;
    peer.pc.ontrack = null;
    peer.pc.onconnectionstatechange = null;
    peer.pc.close();
    if (peer.audio) {
      peer.audio.pause();
      peer.audio.srcObject = null;
    }
    peers.delete(userId);
    publicarParticipantes();
  }

  async function ofrecerA(userId: string, username: string) {
    if (peers.has(userId)) return; // ya hay conexion en curso con ese par
    const peer = crearPeer(userId, username);
    try {
      const oferta = await peer.pc.createOffer();
      await peer.pc.setLocalDescription(oferta);
      enviarSenal(userId, "offer", JSON.stringify(oferta));
    } catch {
      quitarPeer(userId);
    }
  }

  async function aplicarCandidatosPendientes(peer: Peer) {
    for (const c of peer.candidatosPendientes) {
      try {
        await peer.pc.addIceCandidate(c);
      } catch {
        /* candidato invalido: se ignora, la conexion se forma con los demas */
      }
    }
    peer.candidatosPendientes = [];
  }

  return {
    async activar() {
      if (activa()) return true;
      try {
        streamLocal = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        onError("No se pudo acceder al microfono. Revisa los permisos del navegador.");
        return false;
      }
      analizadorLocal = conectarAnalizador(streamLocal);
      void analizadorLocal; // el indicador propio de "hablando" queda para una iteracion futura
      iniciarVad();
      anunciar("presente");
      return true;
    },

    desactivar() {
      if (!activa()) return;
      anunciar("salida");
      for (const id of [...peers.keys()]) quitarPeer(id);
      streamLocal?.getTracks().forEach((t) => t.stop());
      streamLocal = null;
      if (intervaloVad !== null) {
        window.clearInterval(intervaloVad);
        intervaloVad = null;
      }
      audioContext?.close().catch(() => undefined);
      audioContext = null;
      analizadorLocal = null;
      publicarParticipantes();
    },

    alternarMicrofono() {
      const track = streamLocal?.getAudioTracks()[0];
      if (!track) return false;
      track.enabled = !track.enabled;
      return track.enabled;
    },

    silenciarPeer(userId, silenciado) {
      const peer = peers.get(userId);
      if (!peer) return;
      peer.silenciado = silenciado;
      if (peer.audio) peer.audio.muted = silenciado;
      publicarParticipantes();
    },

    manejarAnuncio(anuncio) {
      if (!activa() || anuncio.userId === miUserId) return;
      if (anuncio.tipo === "salida") {
        quitarPeer(anuncio.userId);
        return;
      }
      // "presente": el userId menor crea la oferta; el mayor se da a conocer con senal dirigida.
      if (miUserId < anuncio.userId) {
        void ofrecerA(anuncio.userId, anuncio.username);
      } else {
        enviarSenal(anuncio.userId, "presente", "{}");
      }
    },

    async manejarSenal(senal) {
      if (!activa() || senal.deUserId === miUserId) return;

      if (senal.tipo === "presente") {
        // Un par activo (con userId mayor) se dio a conocer: me toca ofertar (soy el menor).
        if (miUserId < senal.deUserId) void ofrecerA(senal.deUserId, senal.deUsername);
        return;
      }

      if (senal.tipo === "offer") {
        let peer = peers.get(senal.deUserId);
        if (!peer) peer = crearPeer(senal.deUserId, senal.deUsername);
        try {
          await peer.pc.setRemoteDescription(JSON.parse(senal.datos) as RTCSessionDescriptionInit);
          peer.remotaLista = true;
          await aplicarCandidatosPendientes(peer);
          const respuesta = await peer.pc.createAnswer();
          await peer.pc.setLocalDescription(respuesta);
          enviarSenal(senal.deUserId, "answer", JSON.stringify(respuesta));
        } catch {
          quitarPeer(senal.deUserId);
        }
        return;
      }

      const peer = peers.get(senal.deUserId);
      if (!peer) return;

      if (senal.tipo === "answer") {
        try {
          await peer.pc.setRemoteDescription(JSON.parse(senal.datos) as RTCSessionDescriptionInit);
          peer.remotaLista = true;
          await aplicarCandidatosPendientes(peer);
        } catch {
          quitarPeer(senal.deUserId);
        }
        return;
      }

      if (senal.tipo === "ice") {
        const candidato = JSON.parse(senal.datos) as RTCIceCandidateInit;
        if (peer.remotaLista) {
          peer.pc.addIceCandidate(candidato).catch(() => undefined);
        } else {
          peer.candidatosPendientes.push(candidato); // llego antes que la descripcion remota
        }
      }
    },

    estaActiva: activa,
  };
}
