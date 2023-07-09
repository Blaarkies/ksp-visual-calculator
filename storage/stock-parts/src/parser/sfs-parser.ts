import * as peg from 'pegjs'
import { pegSfs } from './sfs-json-template';

export const sfsParser = peg.generate(pegSfs);
