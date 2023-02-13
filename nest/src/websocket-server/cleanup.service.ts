import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export interface UserCleanup
{
    user: User,
    ready: boolean,
}

@Injectable()
export class CleanupService
{
    usersToDelete: UserCleanup[] = [];

    async pushUserToDelete(user: User)
    {
        this.usersToDelete.push({user, ready: false});
    }

    async removeUserToDelete(userId: string)
    {
        this.usersToDelete = this.usersToDelete.filter((v) => {v.user.id !== userId});
    }
    
    getUsersToDelete() : UserCleanup[]
    {
        return this.usersToDelete;
    }

    async markUserAsReady(userId: string)
    {
        this.usersToDelete = this.usersToDelete.map((v) => 
        {
            if (v.user.id === userId)
            {
                return {user: v.user, ready: true};
            }
            return v;
        });
    }
}
