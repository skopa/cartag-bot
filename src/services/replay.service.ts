import { Telegram } from 'telegraf';
import { LicensePlateRecognitionService } from './license-plate-recognition';
import { LicensePlateInfo, LicensePlateManagerService } from './license-plate-manager';
import { mention } from 'telegraf/format';


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

    async getReplaysList(chatId: number, photoUrl: string): Promise<LicencePlateTag[]> {
        const recognition = await this.recognition.recognizePlates(photoUrl);
        const usersIds = await this.licensePlateManager.getUsersIds(recognition);
        return Promise.all(usersIds.map((info) => this.getUserTag(chatId, info)));
    }

    private async getUserTag(chatId: number, document: LicensePlateInfo): Promise<LicencePlateTag> {
        if (!document.exists || document.user_id === null) {
            return { plate: document.plate, tag: null };
        }

        const user = await this.telegram.getChatMember(chatId, document.user_id).catch(() => null);

        if (!user || !user.user) {
            return { plate: document.plate, tag: null };
        }

        const tag = user.user.username
            ? `@${user.user.username}`
            : mention(user.user.first_name, user.user.id).text;

        return { plate: document.plate, tag };
    }
}
