import { Project } from '../../database/models/Project.js';
import { ProjectMember } from '../../database/models/ProjectMember.js';
import { userStore } from '../../auth/stores/userStore.js';
import { projectStore } from './projectStore.js';

export async function seedDemoProjects(): Promise<void> {
  if ((await Project.count()) > 0) return;

  const admin   = await userStore.findByEmail('admin@example.com');
  const leader  = await userStore.findByEmail('leader@example.com');
  const user    = await userStore.findByEmail('user@example.com');
  if (!admin || !leader || !user) return;

  const alpha = await projectStore.create({
    name: 'Project Alpha',
    description: 'Hệ thống quản lý đơn hàng cho đối tác XYZ.',
    techStack: 'React, TypeScript, Node.js, Postgres, AWS',
    partnerName: 'XYZ Ltd.',
    partnerContactName: 'Nguyen Van A',
    partnerEmail: 'a@xyz.com',
    partnerPhone: '+84 900 000 000',
  }, admin.id);

  await projectStore.create({
    name: 'Project Beta',
    description: 'Dự án nội bộ beta.',
    techStack: 'Vue, Go, MySQL',
  }, admin.id);

  const gamma = await projectStore.create({
    name: 'Project Gamma',
    description: 'Dự án đã kết thúc.',
    techStack: 'PHP, Laravel',
  }, admin.id);
  await projectStore.archive(gamma.id);

  await ProjectMember.bulkCreate([
    { projectId: alpha.id, userId: leader.id, addedBy: admin.id },
    { projectId: alpha.id, userId: user.id,   addedBy: admin.id },
  ]);
}
