import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, ParseUUIDPipe, UseGuards, UsePipes } from '@nestjs/common';
import { Channel, Prisma, User } from '@prisma/client';
import { FullAuthGuard } from 'src/auth/guard/full-auth.guard';

import { GetUser } from 'src/users/decorator';
import { ChannelsService } from './channels.service';
import { FindUniqueChannelDto } from './dto/channel-dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { FindUniqueChannelPipe } from './pipe';

@UseGuards(FullAuthGuard)
@Controller('channels')
export class ChannelsController
{
	constructor(private readonly channelsService: ChannelsService) { }

	@Post()
	create(@Body() dto: CreateChannelDto, @GetUser('id', ParseUUIDPipe) id: string): Promise<Channel>
	{
		return this.channelsService.create(dto, id);
	}

	@Get()
	findAll(): Promise<Channel[]>
	{
		return this.channelsService.findAll();
	}

	@Get('/one')
	@UsePipes(new FindUniqueChannelPipe)
	async findOne(@Body() where: FindUniqueChannelDto)
	{
		const channel = this.channelsService.findOne(where);
		if (!channel)
			throw new NotFoundException(`Channel ${where.channelName || where.id} not found`);
		return (channel);
	}

	// @Patch(':id')
	// update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto)
	// {
	// 	return this.channelsService.update(updateChannelDto);
	// }

	@Patch('ban/:id')
	banUser(@Query('id', ParseUUIDPipe) id: string, @Query('chanId', ParseUUIDPipe) chanId: string)
	{

	}

	@Delete(':id')
	remove(@Param('id') id: string)
	{
		return this.channelsService.remove(id);
	}
}
