"use client"

import { useEffect, useRef, useState } from 'react'

import type { DeviceTypes } from '@/types/admin/deviceTypes'

import '../../../../public/css/device.css';

const wsUrl = "ws://188.26.201.61:9911/clinet";
const DRAG_THRESHOLD = 5; // px

export const Device = ({ device } : {device: DeviceTypes}) => {
  const [refreshTime, setRefreshTime] = useState<string>();

  // state
  const [forcedDeviceId] = useState<string>(device.device)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [currentDevice, setCurrentDevice] = useState(null)
  const [screenshotActive, setScreenshotActive] = useState(false)
  const [isImageUpdating, setIsImageUpdating] = useState(false)
  const [pendingBlob, setPendingBlob] = useState(null)
  const [pointerDown, setPointerDown] = useState(false)
  const [startX, setStartX] = useState<number>(0)
  const [startY, setStartY] = useState<number>(0)
  const [dragStarted, setDragStarted] = useState(false)
  const [message, setMessage] = useState<string[]>([])

  // refs
  const logRef = useRef<HTMLDivElement | null>(null);
  const remoteScreenRef= useRef<HTMLImageElement | null>(null)
  const deviceStatusRef = useRef<HTMLDivElement | null>(null)
  const wsControlRef = useRef<WebSocket | null>(null);
  const wsCaptureRef = useRef<WebSocket | null>(null);

  // Effect
  useEffect(() => {
    connectControl();
    connectCapture();
  }, [])

  useEffect(() => {
    if(logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [message])

  useEffect(() => {
    // Handler for keydown event
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(111)
      if (document.activeElement === document.getElementById("textInput")) return;
      e.preventDefault();
      sendControlCommand("key_down", { key: e.key });
    };

    // Handler for keyup event
    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement === document.getElementById("textInput")) return;
      e.preventDefault();
      sendControlCommand("key_up", { key: e.key });
    };

    // Attach event listeners on mount
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const getRefreshInterval = () => {
    if(refreshTime) return parseInt(refreshTime, 10);
  }

  const log = (msg: string) => {
    const time = new Date().toLocaleTimeString();

    setMessage((prevMessages) => [...prevMessages, `${time} ${msg}`]);

  }

  const processScreenshotBlob = (blob: any) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      // @ts-ignore
      const array = new Uint8Array(e.target?.result);
      let offset = -1;

      for (let i = 0; i < array.length - 1; i++) {
        if (array[i] === 0xFF && array[i+1] === 0xD8) {
          offset = i;
          break;
        }
      }

      if (offset === -1) {
        log("JPEG marker (0xFFD8) no encontrado en el Blob. Se usará todo el blob.");
        fixBlob(blob, updateImageFromBlob);

        return;
      }

      const cleanBlob = blob.slice(offset);

      fixBlob(cleanBlob, updateImageFromBlob);
    }

    reader.onerror = function() {
      log("Error leyendo Blob (no se pudo buscar el marcador JPEG).");
    };

    // Leemos sólo los primeros 1024 bytes en la búsqueda
    reader.readAsArrayBuffer(blob.slice(0, 1024));
  }

  const fixBlob = (blob: any, callback: any) => {
    const tail = blob.slice(blob.size - 2, blob.size);
    const reader = new FileReader();

    reader.onload = function(e) {
      // @ts-ignore
      const arr = new Uint8Array(e.target.result);

      if (arr[0] === 0xFF && arr[1] === 0xD9) {
        // Ya termina correctamente
        callback(blob);
      } else {
        log("El blob no termina con 0xFF 0xD9, se ajustará...");
        const fixedBlob = new Blob([blob, new Uint8Array([0xFF, 0xD9])], { type: blob.type });

        callback(fixedBlob);
      }
    };

    reader.onerror = function() {
      log("Error leyendo el final del Blob. Se usará el blob original.");
      callback(blob);
    };

    reader.readAsArrayBuffer(tail);
  }

  const updateImageFromBlob = (blob: any) => {
    setIsImageUpdating(true)
    const reader = new FileReader();

    reader.onloadend = function() {
      const dataUrl = reader.result;
      const tempImg = new Image();

      tempImg.onload = function() {
        if(remoteScreenRef.current) {
          if (typeof dataUrl === 'string') {
            (remoteScreenRef.current as HTMLImageElement).src = dataUrl
          }

          (remoteScreenRef.current as HTMLImageElement).style.display = "block";
        }

        setIsImageUpdating(false)

        // Si quedó un blob pendiente mientras se mostraba este
        if (pendingBlob) {
          const blobPending = pendingBlob;

          setPendingBlob(null);
          processScreenshotBlob(blobPending);
        }
      };

      tempImg.onerror = function() {
        log("Error al cargar imagen desde el DataURL (¿JPEG inválido?).");
        setIsImageUpdating(false)
      };

      if (typeof dataUrl === 'string') {
        tempImg.src = dataUrl
      }
    };

    reader.onerror = function() {
      log("Error leyendo el Blob con FileReader.");
      setIsImageUpdating(false)
    };

    reader.readAsDataURL(blob);
  }

  // ----------------------------------------------------------------
  // WEBSOCKET PARA CAPTURA
  // ----------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const connectCapture = () => {
    if (wsCaptureRef.current) {
      wsCaptureRef.current.close(); // Close existing connection before reconnecting
    }

    const wsCapture = new WebSocket(wsUrl);

    wsCaptureRef.current = wsCapture;

    wsCapture.binaryType = "blob";

    wsCapture.onopen = () => {
      log("wsCapture conectado.");

      // Solo iniciamos la captura si deviceId está asignado
      if (deviceId) {
        wsCapture.send(JSON.stringify({
          fun: "register",
          msgid: 0,
          data: { deviceid: deviceId }
        }));
        wsCapture.send(JSON.stringify({
          fun: "loop_device_screenshot",
          msgid: 0,
          data: {
            deviceid: deviceId,
            time: getRefreshInterval(),
            isjpg: true
          }
        }));
        setScreenshotActive(true)
      }
    };

    wsCapture.onmessage = (event) => {
      // Ver qué llega
      log("wsCapture - Mensaje recibido. Tipo: " + Object.prototype.toString.call(event.data));

      // Procesar blob o ArrayBuffer
      if (event.data instanceof Blob) {
        if (!isImageUpdating) {
          processScreenshotBlob(event.data);
        } else {
          // @ts-ignore
          setPendingBlob(event.data)
        }
      } else if (event.data instanceof ArrayBuffer) {
        const blob = new Blob([event.data], { type: "image/jpeg" });

        if (!isImageUpdating) {
          processScreenshotBlob(blob);
        } else {
          // @ts-ignore
          setPendingBlob(blob)
        }
      }
    };

    wsCapture.onclose = () => {
      log("wsCapture desconectado, reconectando en 3 seg...");
      setTimeout(connectCapture, 3000);
    };

    wsCapture.onerror = (error) => {
      log("wsCapture - Error: " + error);
    };
  }

  // ----------------------------------------------------------------
  // WEBSOCKET PARA CONTROL
  // ----------------------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const connectControl = () => {
    if (wsCaptureRef.current) {
      wsCaptureRef.current.close(); // Close existing connection before reconnecting
    }

    const wsControl = new WebSocket(wsUrl);

    wsControlRef.current = wsControl;

    wsControl.onopen = () => {
      log("wsControl conectado.");

      // Pedimos la lista de dispositivos (aunque no mostremos nada visual)
      wsControl.send(JSON.stringify({ fun: "get_device_list", msgid: 0, data: {} }));
    };

    wsControl.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Cuando recibimos la lista de dispositivos
        if (msg.fun === "get_device_list" && msg.status === 0) {
          const deviceListData = msg.data;

          // Verificamos si nuestro device forzado está en la lista
          if (deviceListData.hasOwnProperty(forcedDeviceId)) {
            const info = deviceListData[forcedDeviceId];

            if (info.state !== 0) {
              // Está online
              setDeviceId(forcedDeviceId)
              setCurrentDevice(info)
              log("Dispositivo encontrado y online: " + forcedDeviceId);

              // Ocultamos el mensaje offline si estaba

              if(deviceStatusRef.current) deviceStatusRef.current.textContent = ""

              // Iniciamos la captura si el wsCapture está listo

              if (wsCaptureRef.current && wsCaptureRef.current.readyState === WebSocket.OPEN) {
                // @ts-ignore
                wsCapture.send(JSON.stringify({
                  fun: "register",
                  msgid: 0,
                  data: { deviceid: deviceId }
                }));

                // @ts-ignore
                wsCapture.send(JSON.stringify({
                  fun: "loop_device_screenshot",
                  msgid: 0,
                  data: {
                    deviceid: deviceId,
                    time: getRefreshInterval(),
                    isjpg: true
                  }
                }));

                // @ts-ignore
                setScreenshotActive(true)

                // Mostramos la imagen en caso de que estuviera oculta
                (remoteScreenRef.current as HTMLImageElement).style.display = "block";
              }
            } else {
              // Existe, pero offline (state=0)
              log("El dispositivo " + forcedDeviceId + " está offline (state=0).");
              showDeviceOffline();
            }
          } else {
            log("No se encontró en la lista el deviceID forzado: " + forcedDeviceId);
            showDeviceOffline();
          }
        } else {
          log("wsControl - Mensaje: " + event.data);
        }
      } catch (e) {
        log("wsControl - No se pudo parsear: " + event.data);
      }
    };

    wsControl.onclose = () => {
      log("wsControl desconectado, reconectando en 3 seg...");
      setTimeout(connectControl, 3000);
    };

    wsControl.onerror = (error) => {
      log("wsControl - Error: " + error);
    };
  }

  // Función para mostrar "Device offline"
  const showDeviceOffline = () => {
    if(deviceStatusRef.current) deviceStatusRef.current.textContent = "Device offline"
    if(remoteScreenRef.current) remoteScreenRef.current.style.display = "none"
  }

  // Para mandar comandos
  const sendControlCommand = (command: any, data = {}) => {

    // @ts-ignore
    if (wsControlRef.current && wsControlRef.current.readyState === WebSocket.OPEN && deviceId) {
      const msg = { fun: command, msgid: 0, data: { deviceid: deviceId, ...data } };

      // @ts-ignore
      wsControlRef.current.send(JSON.stringify(msg));
      log("wsControl - Enviado: " + JSON.stringify(msg));
    } else {
      log("wsControl no está conectado o no se ha asignado deviceId.");
    }
  }

  // ----------------------------------------------------------------
  // EVENTOS DE PUNTERO PARA DRAG/TAP
  // ----------------------------------------------------------------
  const handlePointerDown = (e: any) => {
    setPointerDown(true);
    setStartX(e.clientX)
    setStartY(e.clientY)
    setDragStarted(false)
    if(remoteScreenRef.current) remoteScreenRef.current.setPointerCapture(e.pointerId);
  }

  const handlePointerMove = (e: any) => {
    if (!pointerDown || !currentDevice) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const dx = currentX - startX;
    const dy = currentY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if(remoteScreenRef.current) {
      const rect = remoteScreenRef.current.getBoundingClientRect();

      // @ts-ignore
      const scaleX = Number(currentDevice.width) / remoteScreenRef.current.clientWidth;

      // @ts-ignore
      const scaleY = Number(currentDevice.height) / remoteScreenRef.current.clientHeight;

      if (!dragStarted && distance >= DRAG_THRESHOLD) {
        const sx = Math.round((startX - rect.left) * scaleX);
        const sy = Math.round((startY - rect.top) * scaleY);

        log("Drag detectado, mouse_down en (" + sx + "," + sy + ")");
        sendControlCommand("mouse_down", { button: "left", x: sx, y: sy });
        setDragStarted(true)
      }

      if (dragStarted) {
        const x = Math.round((currentX - rect.left) * scaleX);
        const y = Math.round((currentY - rect.top) * scaleY);

        sendControlCommand("mouse_move", { x: x, y: y });
      }
    }
  }

  const handlePointerUp = (e: any) => {
    if (!pointerDown || !currentDevice) return;
    const endX = e.clientX;
    const endY = e.clientY;
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if(remoteScreenRef.current) {
      const rect = remoteScreenRef.current.getBoundingClientRect();

      // @ts-ignore
      const scaleX = Number(currentDevice.width) / remoteScreenRef.current.clientWidth;

      // @ts-ignore
      const scaleY = Number(currentDevice.height) / remoteScreenRef.current.clientHeight;

      if (!dragStarted && distance < DRAG_THRESHOLD) {
        // Tap
        const x = Math.round((endX - rect.left) * scaleX);
        const y = Math.round((endY - rect.top) * scaleY);

        log("Tap en x=" + x + ", y=" + y);
        sendControlCommand("click", { button: "left", x: x, y: y, time: 0 });
      } else if (dragStarted) {
        log("Fin drag, mouse_up");
        sendControlCommand("mouse_up", { button: "left" });
      }

      setPointerDown(false)
      setDragStarted(false)
    }
  }

  // ----------------------------------------------------------------
  // WHEEL EVENT -> SCROLL
  // ----------------------------------------------------------------
  const handleWheel = (e: any) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? "up" : "down";

    log("Rueda de ratón: dirección = " + direction);
    sendControlCommand("mouse_wheel", { direction: direction, length: 30, number: 1 });
  }

  // Click fallback (si no hay pointer events)
  const handleClickRemoteScreen = (e: any) => {
    if (pointerDown) return;
    if (!currentDevice) return;

    if(remoteScreenRef.current) {
      const rect = remoteScreenRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      // @ts-ignore
      const scaleX = Number(currentDevice.width) / remoteScreenRef.current.clientWidth;

      // @ts-ignore
      const scaleY = Number(currentDevice.height) / remoteScreenRef.current.clientHeight;

      const x = Math.round(offsetX * scaleX);
      const y = Math.round(offsetY * scaleY);

      log("Click en x=" + x + ", y=" + y);
      sendControlCommand("click", { button: "left", x: x, y: y, time: 0 });

      // Refresca la captura tras un pequeño delay
      setTimeout(() => {
        if (screenshotActive && wsCaptureRef.current && wsCaptureRef.current.readyState === WebSocket.OPEN) {
          wsCaptureRef.current.send(JSON.stringify({
            fun: "loop_device_screenshot", msgid: 0,
            data: { deviceid: deviceId, time: getRefreshInterval(), isjpg: true }
          }));
        }
      }, 500);
    }
  };

  // ----------------------------------------------------------------
  // BOTONES DE CONTROL
  // ----------------------------------------------------------------
  const handleClickSendText = (e: any) => {
    const text = e.target.value;

    sendControlCommand("send_key", { key: text, fn_key: "" });
  }

  const handleClickBtnUp = () => {
    sendControlCommand("key_up", { key: "up" })
  }

  const handleClickBtnDown = () => {
    sendControlCommand("key_down", { key: "down" })
  }

  const handleClickBtnLeft = () => {
    sendControlCommand("key_left", { key: "left" })
  }

  const handleClickBtnRight = () => {
    sendControlCommand("key_right", { key: "left" })
  }

  const handleClickBtnHome = () => {
    sendControlCommand("send_key", { key: "", fn_key: "WIN+h" })
  }

  // Lock => "Tab+L"
  const handleClickBtnLock = () => {
    sendControlCommand("send_key", { key: "", fn_key: "Tab+L" })
  }

  // Reset Mouse => "mouse_reset_pos"
  const handleClickBtnMouseReset = () => {
    sendControlCommand("mouse_reset_pos", {});
  }

  // Restart Cellphone => "restart_device"
  const handleClickBtnRestartCellphone = () => {
    sendControlCommand("restart_device", {});
  }

  // ----------------------------------------------------------------
  // BOTÓN PARA MOSTRAR/OCULTAR CONSOLA
  // ----------------------------------------------------------------
  const handleClickToggleConsole = () => {
    if(logRef.current) {
      if (logRef.current.style.display === "none" || logRef.current.style.display === "") {
        logRef.current.style.display = "block";
        logRef.current.textContent = "Hide Console";
      } else {
        logRef.current.style.display = "none";
        logRef.current.textContent = "Show Console";
      }
    }
  }

  // ----------------------------------------------------------------
  // CAMBIO DE INTERVALO DE REFRESCO
  // ----------------------------------------------------------------
  const handleChangeRefreshTime = (e: any) => {
    setRefreshTime(e.target.value)

    if (screenshotActive && wsCaptureRef.current && wsCaptureRef.current.readyState === WebSocket.OPEN && deviceId) {
      wsCaptureRef.current.send(JSON.stringify({
        fun: "loop_device_screenshot", msgid: 0,
        data: {
          deviceid: deviceId,
          time: getRefreshInterval(),
          isjpg: true
        }
      }));
      log("Intervalo de refresco actualizado a " + getRefreshInterval() + " ms.");
    }
  }

  return (
    <div>
      <h1>Control Panel</h1>

      <button id="toggleConsole" onClick={() => handleClickToggleConsole()}>Show Console</button>

      <div className="container">
        <div className="panel">
          <h2>Text Input</h2>
          <textarea id="textInput" placeholder="Enter text..."></textarea>
          <button id="sendText" onClick={handleClickSendText}>Send</button>

          <h2>Controller</h2>
          <div className="controls">
            <button id="btnUp" onClick={() => handleClickBtnUp()}>⬆️</button>
            <button id="btnLeft" onClick={() => handleClickBtnLeft()}>⬅️</button>
            <button id="btnRight" onClick={() => handleClickBtnRight()}>➡️</button>
            <button id="btnDown" onClick={() => handleClickBtnDown()}>⬇️</button>
            <button id="btnHome" onClick={() => handleClickBtnHome()}>🏠 Home</button>
            <button id="btnLock" onClick={() => handleClickBtnLock()}>🔒 Lock</button>
            <button id="btnMouseReset" onClick={() => handleClickBtnMouseReset()}>Reset Mouse</button>
            <button id="btnRestartCellphone" onClick={() => handleClickBtnRestartCellphone()}>Restart Cellphone</button>
          </div>
        </div>

        <div className="panel">
          <h2>Remote Screen</h2>
          <div id="deviceStatus" ref={deviceStatusRef}></div>

          <label htmlFor="refreshTime">Refresh Interval (ms):</label>
          <select id="refreshTime" onChange={handleChangeRefreshTime}>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
          <img
            id="remoteScreen"
            ref={remoteScreenRef}
            alt="Screenshot"
            draggable="false"
            className="hidden"
            onPointerDown={handlePointerDown}
            onClick={handleClickRemoteScreen}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          />
        </div>
      </div>

      <div className="log" id="log" ref={logRef}>
        {
          message?.length && message.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))
        }
      </div>
    </div>
  )
}
