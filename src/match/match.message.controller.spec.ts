import { MatchMessageController } from './match.message.controller';
import { MatchService } from './match.service';

describe('MatchMessageController', () => {
  const matchService = {
    health: jest.fn(),
    createMatch: jest.fn(),
    listMatchesByUserId: jest.fn(),
  };

  let controller: MatchMessageController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new MatchMessageController(
      matchService as unknown as MatchService,
    );
  });

  it('maps the authenticated user and counterpart into the internal match dto', () => {
    matchService.createMatch.mockReturnValue({ id: 1 });

    const result = controller.create({
      userId: 4,
      dto: { counterpartUserId: 9 },
    });

    expect(matchService.createMatch).toHaveBeenCalledWith({
      userAId: 4,
      userBId: 9,
    });
    expect(result).toEqual({ id: 1 });
  });

  it('rejects creating a match when counterpartUserId is missing', () => {
    expect(() =>
      controller.create({
        userId: 4,
        dto: undefined,
      }),
    ).toThrow('counterpartUserId is required');
  });

  it('forwards the user id when listing matches', () => {
    matchService.listMatchesByUserId.mockReturnValue([{ id: 5 }]);

    const result = controller.listByUserId(8);

    expect(matchService.listMatchesByUserId).toHaveBeenCalledWith(8);
    expect(result).toEqual([{ id: 5 }]);
  });
});
