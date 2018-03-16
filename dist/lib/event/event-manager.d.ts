import Handler, { ElementSearchResult } from '../handler';
import Event from './event';
import Catbot from '../bot';
export default class EventManager extends Handler<Event> {
    push(event: Event): Promise<void>;
    find(content: string): ElementSearchResult<Event>;
    constructor(bot: Catbot);
}
