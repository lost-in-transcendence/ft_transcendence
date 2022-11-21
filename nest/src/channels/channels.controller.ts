import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { Channel, User } from '@prisma/client';
import { GetUser } from 'src/users/decorator';

import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Controller('channels')
export class ChannelsController
{
	constructor(private readonly channelsService: ChannelsService) { }

	@Post()
	create(@Body() dto: CreateChannelDto, @GetUser('id', ParseUUIDPipe) user: string): Promise<Channel>
	{
		return this.channelsService.create(dto);
	}

	@Get()
	findAll(): Promise<Channel[]>
	{
		return this.channelsService.findAll();
	}

	@Get('/:id')
	async findOne(@Param('id') id: string)
	{
		const channel = await this.channelsService.findOne(id);
		if (!channel)
			throw new NotFoundException(`Channel ${id} not found`);
		return (channel);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateChannelDto: UpdateChannelDto)
	{
		return this.channelsService.update(id, updateChannelDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string)
	{
		return this.channelsService.remove(+id);
	}
}
