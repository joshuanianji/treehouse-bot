import express from 'express'
import Jimp from 'jimp/es'
import { Request, Response } from 'express';
// any other routes imports would go here

const getTrevRoutes = () => {
    const router = express.Router()
    router.get('/', root);
    return router
};


const root = async (req: Request, res: Response) => {
    const assetsPath = __dirname + '/../../assets/trevor1.jpg'
    const trev1 = await Jimp.read(assetsPath);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    trev1.print(
        font,
        100,
        100,
        {
            text: 'Hello world!',
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        trev1.getWidth(),
        trev1.getHeight()
    );

    const trev1Buffer = await trev1.getBufferAsync(Jimp.MIME_JPEG);
    res.send(trev1Buffer);
}

export { getTrevRoutes }