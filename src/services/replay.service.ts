import { Telegram } from 'telegraf';
import { LicensePlateRecognitionService } from './license-plate-recognition';
import { LicensePlateInfo, LicensePlateManagerService } from './license-plate-manager';
import { mention } from 'telegraf/format';


/**
 * License plate with user mention
 */
interface LicencePlateTag {
    plate: string;
    tag: string | null;
}


export class ReplayService {
    constructor(
        private telegram: Telegram,
        private recognition: LicensePlateRecognitionService,
        private licensePlateManager: LicensePlateManagerService) {
    }

    /**
     * Get list of license plates with user tag for chat
     * @param chatId
     * @param photoUrl
     */
    async getReplaysList(chatId: number, photoUrl: string): Promise<LicencePlateTag[]> {
        const recognition = await this.recognition.recognizePlates(photoUrl);
        const usersIds = await this.licensePlateManager.getUsersIds(recognition);
        const list = await Promise.all(usersIds.map((info) => this.getUserTag(chatId, info)));
        console.info('Replay content', JSON.stringify({ recognition, usersIds, list }));
        return list;
    }

    private async getUserTag(chatId: number, document: LicensePlateInfo): Promise<LicencePlateTag> {
        if (!document.exists || document.user_id === null) {
            return { plate: document.plate, tag: null };
        }

        const member = await this.telegram.getChatMember(chatId, document.user_id).catch(() => null);

        if (!member || !member.user) {
            return { plate: document.plate, tag: null };
        }

        const tag = member.user.username
            ? `@${member.user.username}`
            : mention(member.user.first_name, member.user.id).text;

        return { plate: document.plate, tag };
    }
}
