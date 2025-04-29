import { useEffect, useRef } from "react";

function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      console.log("Received message:", event.data);
      if (event.origin !== new URL(iframeRef.current!.src).origin) {
        return;
      }

      if (event.data.type === "OPEN_WINDOW_4") {
        window.open(event.data.data, "_blank");
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div>
      <h1>Website A (Iframe Container)</h1>
      <iframe
        ref={iframeRef}
        src="https://cross-domain-broadcast-testing.vercel.app"
        width="600"
        height="400"
        title="Website B"
        allow="publickey-credentials-get *; publickey-credentials-create *"
        sandbox="allow-scripts allow-same-origin allow-storage-access-by-user-activation"
      />

      {/* user clicks button in dapp -> sends message to iframe -> opens window from iframe
user clicks button in iframe -> opens window from iframe
user clicks button in dapp -> sends message to iframe -> sends message back to dapp -> opens window from dapp
 */}

      <div>
        <button
          onClick={() => {
            //  send to iframe
            iframeRef.current?.focus();
            iframeRef.current?.contentWindow?.postMessage(
              {
                type: "OPEN_WINDOW",
              },
              "*"
            );
          }}
        >
          1
        </button>

        <button
          onClick={async () => {
            const waitPromise = new Promise((resolve) => {
              const listener = (event: MessageEvent) => {
                window.removeEventListener("message", listener);
                console.log("Received message:", event.data);
                if (event.origin !== new URL(iframeRef.current!.src).origin) {
                  return;
                }

                if (event.data.type === "OPEN_WINDOW_3_RESULT") {
                  window.open(
                    `https://cross-domain-broadcast-testing.vercel.app?windowId=${event.data.data}`,
                    "_blank"
                  );
                  console.log(
                    `Received result from iframe: ${event.data.data}`
                  );
                  resolve(event.data.data);
                }
              };
              window.addEventListener("message", listener);
            });
            iframeRef.current?.contentWindow?.postMessage(
              {
                type: "OPEN_WINDOW_3",
              },
              "*"
            );
            await waitPromise;
          }}
        >
          3
        </button>
      </div>
    </div>
  );
}

export default App;
