import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
import toStream from 'buffer-to-stream';

@Injectable()
export class FileUploadRepository {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = Cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'limit' }, // Redimensionar la imagen
            { quality: 'auto:best' }, // Ajustar automáticamente la calidad manteniendo la mejor calidad posible
            { fetch_format: 'auto' }, // Usar el formato más adecuado
            {
              overlay: {
                font_family: 'Arial',
                font_size: 30,
                text: 'eduardoandresdiaz',
              },
            }, // Agregar marca de agua
            { gravity: 'south_east', x: 10, y: 10 }, // Posicionar la marca de agua
            { color: '#ffffff', opacity: 80, border: '2px_solid_black' }, // Estilo de la marca de agua con opacidad reducida y borde negro
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}

// import { Injectable } from '@nestjs/common';
// import { UploadApiResponse, v2 as Cloudinary } from 'cloudinary';
// import toStream from 'buffer-to-stream';

// @Injectable()
// export class FileUploadRepository {
//   async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
//     return new Promise((resolve, reject) => {
//       const upload = Cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'auto',
//           transformation: [
//             { width: 800, height: 600, crop: 'limit' }, // Redimensionar la imagen
//             { quality: 'auto:best' }, // Ajustar automáticamente la calidad manteniendo la mejor calidad posible
//             { fetch_format: 'auto' }, // Usar el formato más adecuado
//             {
//               overlay: {
//                 font_family: 'Arial',
//                 font_size: 30,
//                 text: 'eduardoandresdiaz',
//               },
//             }, // Agregar marca de agua
//             { gravity: 'south_east', x: 10, y: 10 }, // Posicionar la marca de agua
//             { color: '#ffffff' }, // Estilo de la marca de agua sin opacidad
//           ],
//         },
//         (error, result) => {
//           if (error) {
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         },
//       );
//       toStream(file.buffer).pipe(upload);
//     });
//   }
// }
