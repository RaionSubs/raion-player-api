import { Router, Response, Request } from 'express';
import axios, { AxiosResponse } from "axios";
import randomString from "random-string";
import multer from "multer";
import Path from "path";
import db from "quick.db";



const apiRouter = Router();



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, Path.resolve("public"))
    },
    filename: function (req, file, cb) {
        const suffixRandom = randomString({ length: 25 });
        db.push("videos", { videoId: suffixRandom, ...file });
        console.log(db.all());
        cb(null, suffixRandom + ".mp4")
    }
})


const upload: any = multer({

    fileFilter: (req, file, cb) => {
        if (file.mimetype == "video/mp4") {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },

    storage: storage

});

apiRouter.get("/", async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({ status: true });
});

apiRouter.post("/upload", upload.single("video"), async (req: Request, res: Response): Promise<any> => {
    let videoFile: any = req.file;

    if (!videoFile) {
        return res.status(200).json({ content: "Missing video", code: 501 });
    };

    if (videoFile && videoFile.mimetype !== "video/mp4") {
        return res.status(200).json({ content: "Only .mp4 format allowed!", code: 501 });
    };

    if (videoFile && videoFile.size > 1073741824) {
        return res.status(200).json({ content: "The video file can't be larger than 1GB.", code: 501 });
    };

    console.log("[ADD] New Video Added");


    return res.status(200).json({ ...videoFile, videoId: videoFile.filename.split(".")[0] })


});


interface videoData {
    videoId: string;
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
};

apiRouter.get("/video", async (req: Request, res: Response): Promise<any> => {
    let query: any = req.query.Id as string;
    if (!query) {
        return res.status(200).json({ content: "Missing query videoId", code: 501 });
    };

    let videoData = db.get("videos") || [];

    let filteredData: Array<videoData> = videoData.filter((i: videoData) => i.videoId === query);
    if (!filteredData.length) {
        return res.status(200).json({ content: "Video not found!", code: 501 });
    };
    let getVideo: any;

    filteredData.forEach((video: videoData) => {
        getVideo = video;
    });

    if (!getVideo) {
        return res.status(200).json({ content: "Video not found", code: 501 });
    };


    return res.status(200).sendFile(Path.resolve("public", getVideo.videoId + ".mp4"));

});



export default apiRouter;