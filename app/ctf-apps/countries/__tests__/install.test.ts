import { runInstallation } from '../install';
import { createClient } from 'contentful-management';

jest.mock('contentful-management');

const mockPublish = jest.fn();
const mockPublishAsset = jest.fn();
const mockPublishEntry = jest.fn();

const mockCreateContentTypeWithId = jest.fn().mockImplementation(() => ({ publish: mockPublish }));
const mockCreateAsset = jest.fn().mockImplementation(() => ({ publish: mockPublishAsset }));
const mockCreateEntryWithId = jest.fn().mockImplementation(() => ({ publish: mockPublishEntry }));

const mockEnv = {
  createContentTypeWithId: mockCreateContentTypeWithId,
  createAsset: mockCreateAsset,
  createEntryWithId: mockCreateEntryWithId,
};

const mockSpace = {
  getEnvironment: jest.fn().mockResolvedValue(mockEnv),
};

const mockClient = {
  getSpace: jest.fn().mockResolvedValue(mockSpace),
};

(createClient as jest.Mock).mockReturnValue(mockClient);

describe('runInstallation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates content types and publishes them', async () => {
    await runInstallation({
      spaceId: 'space123',
      environmentId: 'master',
      includeStates: true,
      includeCurrency: true,
    });

    // Expect three content types (country, currency, state)
    expect(mockCreateContentTypeWithId).toHaveBeenCalledTimes(3);
    // Each content type should be published
    expect(mockPublish).toHaveBeenCalledTimes(3);
  });

  it('creates assets and entries', async () => {
    await runInstallation({
      spaceId: 'space123',
      environmentId: 'master',
      includeStates: false,
      includeCurrency: false,
    });

    expect(mockCreateAsset).toHaveBeenCalled();
    expect(mockCreateEntryWithId).toHaveBeenCalled();
  });
});
