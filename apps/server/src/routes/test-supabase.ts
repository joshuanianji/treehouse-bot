import express from 'express'
import { Request, Response, } from 'express';
import { Config } from './../util/supabase';

// any other routes imports would go here

const getRoutes = () => {
    const router = express.Router()
    router.get('/', root);
    return router
};

type ReqQuery = { id: string };
type CustomRequest = Request<{}, {}, {}, ReqQuery>

const root = async (req: CustomRequest, res: Response) => {
    try {
        const supabase = Config.getSupabaseClient();

        console.log('req.query.id', req.query.id);
        const id = req.query.id || '1';

        let { data, error, status } = await supabase
            .from('Dev')
            .select(`id, value`)
            .eq('id', id)

        if (error && status !== 406) {
            throw error
        }

        if (data) {
            res.send(data)
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}

export { getRoutes }