import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {

    constructor(
        private _prismaService: PrismaService
    ) {}

    async getBookmarks(userId: number) {
        return await this._prismaService.bookmark.findMany({
            where: {
                userId
            }
        });
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this._prismaService.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this._prismaService.bookmark.create({
            data: {
                userId,
                ...dto
            }
        });

        return bookmark;
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) { 
        const bookmark = await this._prismaService.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException(
                'Access to resource denied'
            );
        
        return this._prismaService.bookmark.update({
            where: {
                id: bookmarkId
            },
            data: {
                ...dto
            }
        });
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this._prismaService.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        });

        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException(
                'Access to resource denied'
            );
        
        await this._prismaService.bookmark.delete({
            where: {
                id: bookmarkId
            }
        });
    }
}
