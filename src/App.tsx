import "vditor/dist/index.css";
import React from "react";
import Vditor from "vditor";

// Refered from https://github.com/Vanessa219/vditor/blob/master/src/ts/toolbar/Fullscreen.ts
// There seems to be no existing API for toggling fullscreen mode...
const toggleFullScreen = (vditor: IVditor) => {
  vditor.element.style.zIndex = vditor.options.fullscreen?.index.toString()!;
  document.body.style.overflow = "hidden";
  vditor.element.classList.add("vditor--fullscreen");
  Object.keys(vditor.toolbar?.elements!).forEach((key) => {
    const svgElement = vditor.toolbar?.elements![key].firstChild as HTMLElement;
    if (svgElement) {
      svgElement.className = svgElement.className.replace("__n", "__s");
    }
  });
  if (vditor.counter) {
    vditor.counter.element.className = vditor.counter.element.className.replace("__n", "__s");
  }

  if (vditor.devtools) {
    vditor.devtools.renderEchart(vditor);
  }
}

const App = () => {
  const [vd, setVd] = React.useState<Vditor>();

  React.useEffect(() => {
    const vditor = new Vditor("vditor", {
      placeholder: "Start Typing Here",
      theme: "dark",
      preview: {
        theme: {
          current: "dark"
        }
      },
      toolbar: [
        "emoji",
        "headings",
        "bold",
        "italic",
        "strike",
        "link",
        "|",
        "list",
        "ordered-list",
        "check",
        "outdent",
        "indent",
        "|",
        "quote",
        "line",
        "code",
        "inline-code",
        "insert-before",
        "insert-after",
        "table",
        "|",
        "undo",
        "redo",
        "|",
        "edit-mode",
        {
          name: "more",
          toolbar: [
            "both",
            "code-theme",
            "content-theme",
            "export",
            "outline",
            "preview",
            "devtools",
            "info",
            "help",
          ],
        },
      ],
      after: () => {
        vditor.setValue('');
        vditor.focus();
        toggleFullScreen(vditor.vditor);
        setVd(vditor);
      },
    });
  }, []);
  return (
    <div>
      <div id="vditor" className="vditor" />
    </div>);
};

export default App;
