import { useEffect, useState } from "react";

export function AppTestBroadcast() {
  const [messages, setMessages] = useState<string[]>([]);

  function handleMessage(event: MessageEvent) {
    // Only accept messages from our origin
    if (event.origin !== "https://localhost:5173") return;

    if (event.data.type === "MESSAGE") {
      console.log("Received message in test window:", event.data.data);
      setMessages((prev) => [...prev, event.data.data]);
    }
  }

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setupPasskey = async (options: any) => {
    try {
      // Log the options being used
      console.log("Setting up passkey with options:", options);

      // Use the WebAuthn API to create a real passkey
      const publicKeyCredentialCreationOptions = {
        challenge: options.challenge,
        rp: {
          name: "Test Website B",
          id: "localhost",
        },
        user: {
          id: new Uint8Array(
            options.userId.split("").map((c: string) => c.charCodeAt(0))
          ),
          name: options.userName,
          displayName: options.userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
        },
      };

      const credential = await navigator.credentials.create({
        publicKey:
          publicKeyCredentialCreationOptions as PublicKeyCredentialCreationOptions,
      });

      // Send success response back to opener
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "PASSKEY_SETUP_RESULT",
            data: {
              success: true,
              passkey: credential,
            },
          },
          "https://localhost:5173"
        );
      }
    } catch (error) {
      console.error("Error setting up passkey:", error);

      // Send error response back to opener
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "PASSKEY_SETUP_RESULT",
            data: {
              success: false,
              error: String(error),
            },
          },
          "https://localhost:5173"
        );
      }
    }
  };

  const handleSetupPasskeyClick = () => {
    // Create options for WebAuthn passkey setup
    const defaultOptions = {
      challenge: new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ]).buffer,
      userId: "user-" + Math.random().toString(36).substring(2, 9),
      userName: "Test User",
    };

    setupPasskey(defaultOptions);
  };

  const sendMessage = () => {
    // Send message back to opener window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "MESSAGE",
          data: "Hello from Test Window!",
        },
        "https://localhost:5173"
      );
    }
  };

  return (
    <div>
      <h1>Website B - Test Window</h1>
      <p>Listening for messages...</p>
      <button onClick={sendMessage}>Send Message Back</button>
      <button
        onClick={handleSetupPasskeyClick}
        style={{
          marginLeft: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
        }}
      >
        Setup Passkey Manually
      </button>
      <div style={{ marginTop: "20px" }}>
        <h3>Received Messages:</h3>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              margin: "10px 0",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
