import {
    ReplyMessageOptions, MessagePayload, Message, MessageReference, MessageAttachment,
    TextChannel, DMChannel, NewsChannel, ThreadChannel, PartialDMChannel, Collection,
    Sticker
} from 'discord.js';
import { command } from '../../../src/commands/nft';
import { checkMsg, getNFTType } from '../../../src/commands/nft/createNFT';
import ExtendedClient from './../../../src/client/client';
import { left, isLeft, isRight } from 'fp-ts/lib/Either';
import { nftAssetType } from 'custom-types/src/nft';

describe('NFT Command', () => {
    let mockClient: Partial<ExtendedClient>;
    let mockMessage: Partial<Message>;
    let mockRepliedTo: Partial<Message>;
    let args: string[];

    type AllChannels = TextChannel | DMChannel | NewsChannel | ThreadChannel | PartialDMChannel

    beforeEach(() => {
        mockRepliedTo = {
            type: 'DEFAULT',
            content: '',
            attachments: new Collection<string, MessageAttachment>(),
            stickers: new Collection<string, Sticker>(),
            valueOf: jest.fn() // without this, we get a "types returned by 'valueOf()' are incompatible between these types." error
        }
        mockClient = {};
        // https://stackoverflow.com/q/60001881
        // Remember the mockReturnValue
        let mockChannel = {
            send: jest.fn().mockReturnValue(Promise.resolve(mockMessage)),
            messages: {
                fetch: jest.fn().mockReturnValue(Promise.resolve(mockRepliedTo)), // always fetch repliedTo msg
            }
        };
        mockMessage = {
            type: 'DEFAULT',
            reply: jest.fn() as (options: string | MessagePayload | ReplyMessageOptions) => Promise<Message>,
            channel: mockChannel as unknown as AllChannels, // yeah who cares about type safety during tests, right?
            reference: null,
            valueOf: jest.fn() // somehow this is needed...
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkMsg works correctly', () => {
        describe('Message reply checks', () => {
            it('should fail when the type is not a reply', async () => {
                mockMessage.type = 'DEFAULT';
                const res = await checkMsg(mockMessage as Message)
                expect(isLeft(res)).toBe(true);
            })
            it('Should fail when the reference is null', async () => {
                mockMessage.reference = null;
                const res = await checkMsg(mockMessage as Message)
                expect(isLeft(res)).toBe(true);
            })
            it('Should fail when the reference messageID is null', async () => {
                mockMessage.reference = { messageId: null } as unknown as MessageReference;
                const res = await checkMsg(mockMessage as Message)
                expect(isLeft(res)).toBe(true);
            })
            it('Should call `fetch` with messageID', async () => {
                mockMessage.type = 'REPLY';
                mockMessage.reference = { messageId: '123' } as unknown as MessageReference;
                await checkMsg(mockMessage as Message)
                expect(mockMessage.channel?.messages.fetch).toHaveBeenCalledWith('123');
            })
            it('Should call `fetch` with messageID', async () => {
                mockMessage.type = 'REPLY';
                mockMessage.reference = { messageId: '123' } as unknown as MessageReference;
                await checkMsg(mockMessage as Message)
                expect(mockMessage.channel?.messages.fetch).toHaveBeenCalledWith('123');
            })
        })
        describe('repliedTo checks', () => {
            beforeEach(() => {
                mockMessage.type = 'REPLY';
                mockMessage.reference = { messageId: '123' } as unknown as MessageReference;
            })

            describe('Should only pass when repliedTo.type is DEFAULT or REPLY', () => {
                it('Should pass on Default:', async () => {
                    mockRepliedTo.type = 'DEFAULT';
                    const res = await checkMsg(mockMessage as Message)
                    expect(isLeft(res)).toBe(true);
                })
                it('Should pass on reply', async () => {
                    mockRepliedTo.type = 'REPLY';
                    const res = await checkMsg(mockMessage as Message)
                    expect(isLeft(res)).toBe(true);
                })
                it('Should fail on another type', async () => {
                    mockRepliedTo.type = 'RECIPIENT_ADD';
                    const res = await checkMsg(mockMessage as Message)
                    expect(isLeft(res)).toBe(true);
                    expect(res).toEqual(left('Only default replies are supported.'));
                })
            })
            describe('Should only pass when replied.to has a valid attachment/content', () => {
                it('Should fail on no valid attachments', async () => {
                    mockRepliedTo.content = '';
                    mockRepliedTo.attachments = new Collection();
                    mockRepliedTo.stickers = new Collection();

                    const res = await checkMsg(mockMessage as Message)
                    expect(isLeft(res)).toBe(true);
                    expect(res).toEqual(left('You need to reply to a message with text, attachment or sticker to create an NFT'));
                })
                it('Should pass with content', async () => {
                    mockRepliedTo.content = 'asda';
                    const res = await checkMsg(mockMessage as Message)
                    expect(isRight(res)).toBe(true);
                })
                it('Should pass with attachments', async () => {
                    mockRepliedTo.attachments = new Collection([['a', {} as unknown as MessageAttachment]]);
                    const res = await checkMsg(mockMessage as Message)
                    expect(isRight(res)).toBe(true);
                })
                it('Should pass with stickers', async () => {
                    mockRepliedTo.stickers = new Collection([['a', {} as unknown as Sticker]]);
                    const res = await checkMsg(mockMessage as Message)
                    expect(isRight(res)).toBe(true);
                })
            })

        })
    })

    describe('getNFTType works correctly', () => {
        describe('with MessageAttachment', () => {
            let mockMessageAttachment: Partial<MessageAttachment>;

            beforeEach(() => {
                mockMessageAttachment = {
                    contentType: 'image/png',
                    name: 'test.png',
                    height: 100,
                    width: 100,
                    size: 100,
                    url: 'https://test.com/test.png',
                }
            })

            it('Fails with a bad content type', () => {
                mockMessageAttachment.contentType = 'text/plain';
                mockRepliedTo.attachments?.set('a', mockMessageAttachment as MessageAttachment);
                const res = getNFTType(mockRepliedTo as Message);
                expect(isLeft(res)).toBe(true);
                expect(res).toMatchObject({ left: 'Attachment type text/plain is not supported' });
            })
            it('fails when the size is too big', () => {
                mockMessageAttachment.size = 1000000000000000;
                mockRepliedTo.attachments?.set('a', mockMessageAttachment as MessageAttachment);
                const res = getNFTType(mockRepliedTo as Message);
                expect(isLeft(res)).toBe(true);
                expect(res).toMatchObject({ left: 'Attachment is too large to be NFTized. Max size is 8MB' });
            })
            it('Succeeds otherwise, matching url', () => {
                mockRepliedTo.attachments?.set('a', mockMessageAttachment as MessageAttachment);
                const res = getNFTType(mockRepliedTo as Message);
                expect(isRight(res)).toBe(true);
                expect(res).toMatchObject({ right: nftAssetType('image/png', 'https://test.com/test.png') });
            })
        })
    })
})
