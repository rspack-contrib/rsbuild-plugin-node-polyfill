import path from 'node:path';
// biome-ignore lint: test non-import protocol
import querystring from 'querystring';

const bufferData = Buffer.from('abc');

const qsRes = querystring.stringify({
	foo: 'bar',
});

document.querySelector('#root').innerHTML = `
  <div>
    <div id="test-buffer">${bufferData.join('')}</div>
    <div id="test-querystring">${qsRes}</div>
    <div id="test-path">${path.join('foo', 'bar')}</div>
    <div id="test">Hello Rsbuild!</div>
  </div>
`;
