/* eslint-disable @typescript-eslint/no-unused-vars */
function App() {
  // @ts-expect-error test
  let newWindow: Window | null = null;
  const openNewWindow = () => {
    newWindow = window.open(
      "https://cross-domain-broadcast-testing.vercel.app",
      crypto.randomUUID(),
      "width=600,height=400"
    );
  };

  // useEffect(() => {
  //   window.addEventListener("message", (event) => {
  //     if (event.data.type === "OPEN_WINDOW") {
  //       openNewWindow();
  //       console.log(`Opened new window: ${newWindow?.location.href}`);
  //     } else if (event.data.type === "OPEN_WINDOW_3") {
  //       window.parent.postMessage(
  //         {
  //           type: "OPEN_WINDOW_3_RESULT",
  //         },
  //         "*"
  //       );
  //       console.log("Sent back to dapp");
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  async function hasCookieAccess() {
    // Check if Storage Access API is supported
    if (!document.requestStorageAccess) {
      // Storage Access API is not supported so best we can do is
      // hope it's an older browser that doesn't block 3P cookies.
      return true;
    }

    // Check if access has already been granted
    if (await document.hasStorageAccess()) {
      return true;
    }

    // Check the storage-access permission
    // Wrap this in a try/catch for browsers that support the
    // Storage Access API but not this permission check
    // (e.g. Safari and earlier versions of Firefox).
    let permission;
    try {
      permission = await navigator.permissions.query({
        name: "storage-access",
      });
    } catch (error) {
      // storage-access permission not supported. Assume no cookie access.
      return false;
    }

    if (permission) {
      if (permission.state === "granted") {
        // Permission has previously been granted so can just call
        // requestStorageAccess() without a user interaction and
        // it will resolve automatically.
        try {
          await document.requestStorageAccess();
          return true;
        } catch (error) {
          // This shouldn't really fail if access is granted, but return false
          // if it does.
          return false;
        }
      } else if (permission.state === "prompt") {
        // Need to call requestStorageAccess() after a user interaction
        // (potentially with a prompt). Can't do anything further here,
        // so handle this in the click handler.
        return false;
      } else if (permission.state === "denied") {
        // Not used: see https://github.com/privacycg/storage-access/issues/149
        return false;
      }
    }

    // By default return false, though should really be caught by earlier tests.
    return false;
  }

  const openWindowInsideIframe = () => {
    window.parent.postMessage(
      {
        type: "OPEN_WINDOW_4",
        data: "https://cross-domain-broadcast-testing.vercel.app",
      },
      "*"
    );
  };

  const requestStorageAccess = async () => {
    const hasAccess = await hasCookieAccess();
    if (hasAccess) {
      console.log("hasAccess", true);
    } else {
      console.log("hasAccess", false);
    }

    document.requestStorageAccess().then(
      (handle) => {
        console.log("localStorage access granted");
        console.log(`handle before:`, handle);
        // @ts-expect-error wrongly erroring on setItem
        handle.localStorage.setItem("foo", "bar");
        // @ts-expect-error wrongly erroring on getItem
        console.log(`setItem result:`, handle.localStorage.getItem("foo"));
        console.log(`handle after:`, handle);
      },
      () => {
        console.log("localStorage access denied");
      }
    );
  };

  const requestStorageAccessWithLocalStorage = async () => {
    const hasAccess = await hasCookieAccess();
    if (hasAccess) {
      console.log("hasAccess", true);
    } else {
      console.log("hasAccess", false);
    }

    // @ts-expect-error wrongly erroring on requestStorageAccess
    document.requestStorageAccess({ localStorage: true }).then(
      (handle) => {
        console.log("localStorage access granted");
        console.log(`handle before:`, handle);
        // @ts-expect-error wrongly erroring on setItem
        handle.localStorage.setItem("foo", "bar");
        // @ts-expect-error wrongly erroring on getItem
        console.log(`setItem result:`, handle.localStorage.getItem("foo"));
        console.log(`handle after:`, handle);
      },
      () => {
        console.log("localStorage access denied");
      }
    );
  };

  return (
    <div>
      <h1>Website B (Iframe Content)</h1>
      <button onClick={openNewWindow}>2</button>
      <button onClick={openWindowInsideIframe}>4</button>

      <button onClick={requestStorageAccess}>requestStorageAccess</button>
      <button onClick={requestStorageAccessWithLocalStorage}>
        requestStorageAccess (localStorage)
      </button>

      {/* <button onClick={sendMessage}>Send Message to New Window</button> */}
    </div>
  );
}

export default App;
