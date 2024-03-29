import express from 'express'
import { Config } from '../util/config';
import { sparseType, optional } from 'io-ts-extra';
import * as i from 'io-ts';
import { parseQuery } from '../middleware/parseQuery';
import chalk from 'chalk';


// any other routes imports would go here


const Query = sparseType({
    id: optional(i.string),
})

const router = express.Router()
router.get('/', parseQuery(Query), async (req, res) => {
    console.log(`${chalk.green('[SUPABASE]')} ${chalk.cyan('GET')} ${chalk.yellow('/')}`)
    try {
        const { supabase, tableName } = Config.getSupabaseClient();

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
});

export { router }
