const bufferData1 = Buffer.from('abc');

document.querySelector('#root').innerHTML = `
  <div>
    <div id="test-buffer1">${bufferData1.join('')}</div>
  </div>
`;
