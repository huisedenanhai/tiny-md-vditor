import 'vditor/dist/index.css';
import React from 'react';
import Vditor from 'vditor';
import { appWindow } from '@tauri-apps/api/window'
import * as fs from '@tauri-apps/api/fs';
import * as dialog from '@tauri-apps/api/dialog';
import { dirname } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';

// Refered from https://github.com/Vanessa219/vditor/blob/master/src/ts/toolbar/Fullscreen.ts
// There seems to be no existing API for toggling fullscreen mode...
const enterFullScreen = (vditor: IVditor) => {
  vditor.element.style.zIndex = vditor.options.fullscreen?.index.toString()!;
  document.body.style.overflow = 'hidden';
  vditor.element.classList.add('vditor--fullscreen');
  Object.keys(vditor.toolbar?.elements!).forEach((key) => {
    const svgElement = vditor.toolbar?.elements![key].firstChild as HTMLElement;
    if (svgElement) {
      svgElement.className = svgElement.className.replace('__n', '__s');
    }
  });
  if (vditor.counter) {
    vditor.counter.element.className = vditor.counter.element.className.replace('__n', '__s');
  }

  if (vditor.devtools) {
    vditor.devtools.renderEchart(vditor);
  }
}

const loadFile = async (vditor: Vditor, path: string) => {
  if (path.endsWith('.md')) {
    const contents = await fs.readTextFile(path);
    vditor.setValue(contents);
  }
}

const dialogOpenOptions = {
  directory: false,
  multiple: false,
  filters: [{
    name: 'Markdown',
    extensions: ['md'],
  }]
};

const openFileWithDialog = async (setCurrentFile: any) => {
  const selected = await dialog.open(dialogOpenOptions);
  if (typeof selected === 'string') {
    setCurrentFile(selected);
  }
}

const registerEvents = (vd: Vditor, currentFile: string | undefined, setCurrentFile: any) => {
  let unlistenFileDropEvent = appWindow.onFileDropEvent(async ({ payload }) => {
    if (payload.type === 'drop') {
      for (let path of payload.paths) {
        if (path.endsWith('.md')) {
          setCurrentFile(path);
          break;
        }
      }
    }
  });

  let unlistenMenuClicked = appWindow.onMenuClicked(async ({ payload: menuId }) => {
    if (menuId === 'save') {
      if (currentFile == undefined) {
        let selected = await dialog.save(dialogOpenOptions);
        fs.writeTextFile(selected, vd.getValue());
        setCurrentFile(selected);
      } else {
        fs.writeTextFile(currentFile, vd.getValue());
      }
    }
    if (menuId === 'open') {
      await openFileWithDialog(setCurrentFile);
    }
  });

  return () => {
    (async () => {
      (await unlistenFileDropEvent)();
      (await unlistenMenuClicked)();
    })();
  };
}

const initVditor = async (setVd: any, currentFile: string | undefined, firstTimeLoad: boolean) => {
  const vditor = new Vditor('vditor', {
    placeholder: 'Start Typing Here...',
    theme: 'dark',
    cdn: '',
    preview: {
      theme: {
        current: 'dark',
        path: '/dist/css/content-theme'
      },
      hljs: {
        style: 'dracula'
      },
      markdown: {
        toc: true,
        linkBase: currentFile === undefined ? '' : convertFileSrc(await dirname(currentFile))
      }
    },
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help',
        ],
      },
    ],
    after: () => {
      if (firstTimeLoad && currentFile === undefined) {
        vditor.setValue('');
      } else {
        loadFile(vditor, currentFile ?? '');
      }
      vditor.focus();
      enterFullScreen(vditor.vditor);
      setVd(vditor);
    },
  });
}

const App = () => {
  const [vd, setVd] = React.useState<Vditor>();
  const [currentFile, setCurrentFile] = React.useState<string>();

  React.useEffect(() => {
    initVditor(setVd, currentFile, vd === undefined);
  }, [currentFile]);

  React.useEffect(() => {
    if (vd === undefined) {
      return;
    }
    return registerEvents(vd, currentFile, setCurrentFile);
  });

  return <div id='vditor' className='vditor' />;
};

export default App;
