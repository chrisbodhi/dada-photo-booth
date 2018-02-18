#! /usr/bin/env node

import Io from 'socket.io';
import Opencv from 'opencv';
import Image from './models/image';

const io = Io();

function detectFace (image) {
  return new Promise((resolve, reject) => {
    image.detectObject(`${__dirname}/face.xml`,
      {},
      (err, faces) => {
        if (err) {
          throw reject(err);
        }
        resolve(faces);
      });
  });
}

io.on('connection', (socket) => {
  console.log(socket.client.id);
  socket.on('image', (data) => {
    const image = new Image(data);
    image.build().then((imgBuffer) => {
      Opencv.readImage(imgBuffer, (err, imgMatrix) => {
        if (err) {
          console.log(err);
        }
        detectFace(imgMatrix).then((faces) => {
          socket.emit('faces', faces);
        }).catch(e => console.log(e));
      });
    });
  });
});

console.log('Socket listen on 3000');
io.listen(3000);
