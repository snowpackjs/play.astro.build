import type { editor as Editor } from 'monaco-editor';
import type { RefObject } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const useAstroWorker = (worker: Worker, editorInstance: RefObject<Editor.IStandaloneCodeEditor>, deps: any[]) => {
  const [js, setJs] = useState('');
  const trackedValue = useRef('');

  useEffect(() => {
    if (!editorInstance.current) return;
    const editor = editorInstance.current;

    const model = editor.getModel();
    const value = model.getValue();
    trackedValue.current = value;
    worker.postMessage(JSON.stringify({ filename: model.uri.path, value }));
  }, deps);

  useEffect(() => {
    async function handleMessage({ data }: any) {
      if (data.warn) {
        console.warn(data.warn + ' \n');
        return;
      }

      if (data.ready) {
        // fileSizeEl.textContent = `...`;
        return;
      }

      if (data.error) {
        console.error(data.type + ' (please create a new issue in the repo)\n', data.error);
        // fileSizeEl.textContent = `Error`;
        return;
      }

      let { content, input } = data.value;
      console.log(trackedValue.current === input)
      if (trackedValue.current === input) {
        setJs(content)
      }
    }
    worker.onmessage = handleMessage;
  }, []);

  return js;
};

export default useAstroWorker;
