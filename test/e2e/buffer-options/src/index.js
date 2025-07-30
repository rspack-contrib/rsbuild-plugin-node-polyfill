const bufferData1 = Buffer.from('abc');
const bufferData2 = global.Buffer.from('abc');
const bufferData3 = globalThis.Buffer.from('abc');

document.querySelector('#root').innerHTML = `
  <div>
    <div id="test-buffer1">${bufferData1.join('')}</div>
    <div id="test-buffer2">${bufferData2.join('')}</div>
    <div id="test-buffer3">${bufferData3.join('')}</div>
  </div>
`;
