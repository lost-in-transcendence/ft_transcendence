export interface SharedUserIncludeQueryDto
{
    readonly friends: string;
    
    readonly friendTo: string;

    readonly blacklist: string;

    readonly blacklistedBy: string;

    readonly matchHistory: string;

    readonly playStats: string;

    readonly channels: string;

    readonly messages: string;
}

export interface SharedUserSelectQueryDto
{
    readonly id: string;

    readonly id42: string;

    readonly userName: string;

    readonly email: string;

    readonly createdAt: string;

    readonly status: string;
}