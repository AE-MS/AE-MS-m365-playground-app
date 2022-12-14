import { useContext, useState } from "react";
import { Image, Menu } from "@fluentui/react-northstar";
import "./Welcome.css";
import { EditCode } from "./EditCode";
import { app, authentication, pages } from "@microsoft/teams-js";
import { AzureFunctions } from "./AzureFunctions";
import { Graph } from "./Graph";
import { CurrentUser } from "./CurrentUser";
import { useData } from "@microsoft/teamsfx-react";
import { Deploy } from "./Deploy";
import { Publish } from "./Publish";
import { TeamsFxContext } from "../Context";

function onShareDeepLinkbutton() {
  pages.shareDeepLink({subPageId: "subPageId", subPageLabel: "subPageLabel"});
}

async function onGetAuthToken() {
  try {
    const theToken = await authentication.getAuthToken();
    console.log(`Got the token`);
    console.log(theToken);
  } catch (error) {
    console.log(`Error getting token: ${error}`)
  }
}

function onLinkToSecondTab() {
  pages.navigateToApp({
    appId: "677ec375-95f6-41a0-b41c-72d7d0a97a9e",
    pageId: "index1",
  });
}

export function Welcome(props: { showFunction?: boolean; environment?: string }) {
  const { showFunction, environment } = {
    showFunction: true,
    environment: window.location.hostname === "localhost" ? "local" : "azure",
    ...props,
  };
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const steps = ["local", "azure", "publish"];
  const friendlyStepsName: { [key: string]: string } = {
    local: "1. Build your app locally",
    azure: "2. Provision and Deploy to the Cloud",
    publish: "3. Publish to Teams",
  };
  const [selectedMenuItem, setSelectedMenuItem] = useState("local");
  const items = steps.map((step) => {
    return {
      key: step,
      content: friendlyStepsName[step] || "",
      onClick: () => setSelectedMenuItem(step),
    };
  });

  const { teamsfx } = useContext(TeamsFxContext);
  const { loading, data, error } = useData(async () => {
    if (teamsfx) {
      const userInfo = await teamsfx.getUserInfo();
      return userInfo;
    }
  });
  const userName = (loading || error) ? "": data!.displayName;
  const context = useData(async () => {
    await app.initialize();
    const context = await app.getContext();    
    return context;
  })?.data;

  const hubName: string | undefined = context?.app.host.name;
  const pageId: string | undefined = context?.page.id;

  return (
    <div className="welcome page">
      <div className="narrow page-padding">
        <Image src="hello.png" />
        <h1 className="center">Congratulations{userName ? ", " + userName : ""}!</h1>
        {hubName && (
          <p className="center">Your app is running in {hubName}</p>
        )}
        <p className="center">Your app is running in your {friendlyEnvironmentName}</p>
        {pageId && (
          <p className="center">The page id is {pageId}</p>
        )}
        <button onClick={onGetAuthToken}>Get auth token</button>
        <button onClick={onShareDeepLinkbutton}>Share a deep link</button>
        <button onClick={onLinkToSecondTab}>Link to Second Tab</button>
        <Menu defaultActiveIndex={0} items={items} underlined secondary />
        <div className="sections">
          {selectedMenuItem === "local" && (
            <div>
              <EditCode showFunction={showFunction} />
              <CurrentUser userName={userName} />
              <Graph />
              {showFunction && <AzureFunctions />}
            </div>
          )}
          {selectedMenuItem === "azure" && (
            <div>
              <Deploy />
            </div>
          )}
          {selectedMenuItem === "publish" && (
            <div>
              <Publish />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
