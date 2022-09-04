import { Logger, LoggerManager } from '../../logger/server';

export const logger = new Logger('Push', {}, __filename);
export { LoggerManager };
