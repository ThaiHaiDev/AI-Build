import { TestAccount, type Environment } from '../../database/models/TestAccount.js';

export interface TestAccountRecord {
  id:          string;
  projectId:   string;
  environment: Environment;
  label:       string;
  username:    string;
  password:    string;
  url:         string | null;
  note:        string | null;
  createdBy:   string;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface CreateTestAccountInput {
  projectId:   string;
  environment: Environment;
  label:       string;
  username:    string;
  password:    string;
  url?:        string | null;
  note?:       string | null;
}

export type UpdateTestAccountInput = Partial<Pick<CreateTestAccountInput, 'environment' | 'label' | 'username' | 'password' | 'url' | 'note'>>;

const toRecord = (a: TestAccount): TestAccountRecord => ({
  id:          a.id,
  projectId:   a.projectId,
  environment: a.environment,
  label:       a.label,
  username:    a.username,
  password:    a.password,
  url:         a.url ?? null,
  note:        a.note ?? null,
  createdBy:   a.createdBy,
  createdAt:   a.createdAt,
  updatedAt:   a.updatedAt,
});

export const testAccountStore = {
  async findByProject(projectId: string): Promise<TestAccountRecord[]> {
    const rows = await TestAccount.findAll({
      where: { projectId },
      order: [['environment', 'ASC'], ['label', 'ASC']],
    });
    return rows.map(toRecord);
  },

  async findById(id: string): Promise<TestAccountRecord | null> {
    const a = await TestAccount.findByPk(id);
    return a ? toRecord(a) : null;
  },

  async create(input: CreateTestAccountInput, createdBy: string): Promise<TestAccountRecord> {
    const a = await TestAccount.create({
      projectId:   input.projectId,
      environment: input.environment,
      label:       input.label.trim(),
      username:    input.username.trim(),
      password:    input.password,
      url:         input.url ?? null,
      note:        input.note ?? null,
      createdBy,
    });
    return toRecord(a);
  },

  async update(id: string, patch: UpdateTestAccountInput): Promise<TestAccountRecord | null> {
    const a = await TestAccount.findByPk(id);
    if (!a) return null;
    if (patch.environment !== undefined) a.environment = patch.environment;
    if (patch.label !== undefined) a.label = patch.label.trim();
    if (patch.username !== undefined) a.username = patch.username.trim();
    if (patch.password !== undefined) a.password = patch.password;
    if (patch.url !== undefined) a.url = patch.url ?? null;
    if (patch.note !== undefined) a.note = patch.note ?? null;
    await a.save();
    return toRecord(a);
  },

  async remove(id: string): Promise<boolean> {
    const deleted = await TestAccount.destroy({ where: { id } });
    return deleted > 0;
  },
};
