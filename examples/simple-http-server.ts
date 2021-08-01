import http from 'http';

const server = http.createServer((req, res) => {
  setTimeout(() => {
    res.writeHead(Math.random() < 0.1 ? 500 : 200);
    res.end('Hello, World!');

    process.stdout.write('.');
  }, 100);
});

server.listen(8080);
