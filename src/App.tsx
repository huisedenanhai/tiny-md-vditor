import "vditor/dist/index.css";
import React from "react";
import Vditor from "vditor";

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
        "|",
        "upload",
        "record",
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
        setVd(vditor);
      },
    });
  }, []);
  return (
    <div>
      <div id="vditor" className="vditor vditor--fullscreen" />
    </div>);
};

export default App;
