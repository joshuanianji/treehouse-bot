import express from 'express'
import Jimp from 'jimp/es'
import { Request, Response } from 'express';
import { TrevResponse } from 'custom-types'
// any other routes imports would go here

const getRoutes = () => {
    const router = express.Router()
    router.get('/', root);
    return router
};


type ReqQuery = { text: string };
type TrevRequest = Request<{}, {}, {}, ReqQuery>
type Res = Response<TrevResponse>


const root = async (req: TrevRequest, res: Res) => {
    let text = req.query.text;

    if (text === '') {
        text = 'Hello World!'
    }

    const assetsPath = __dirname + '/../../assets';
    const trev1 = await Jimp.read(assetsPath + '/trevor1.jpg');
    const goulongFont = await Jimp.loadFont(assetsPath + '/fonts/goulong-bold.fnt');
    const goulongFontOutline = await Jimp.loadFont(assetsPath + '/fonts/goulong-bold-outline.fnt');

    for (const font of [goulongFont, goulongFontOutline]) {
        trev1.print(
            font,
            0,
            0,
            {
                text: text,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP
            },
            trev1.getWidth(),
            trev1.getHeight()
        );
    }

    const base64 = await trev1.getBase64Async(Jimp.MIME_JPEG);
    res.send({
        type: 'base64',
        data: base64,
        width: trev1.getWidth(),
        height: trev1.getHeight(),
        ext: 'jpg'
    });
}

export { getRoutes }