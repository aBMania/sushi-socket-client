export interface IUser {
    id: number;
    name: string;
    screen_name: string;
    description: string;
    created_at: string;
}

export interface ITweet {
    id: number;
    text: string;
    source: string;
    user: IUser;
    quoted_status?: ITweet;
}