import { AppDataSource } from "../../database/data-source.js";
import { Project } from "../entity/Project.js";
import { User } from "../entity/User.js";
import { createProjectRequestBody } from "../interfaces/projectInterface.js";

export async function projectRegister(
  dataProjectRegister: createProjectRequestBody,
  userId: number
) {
  const { name, description } = dataProjectRegister;

  // validação simples
  if (!name?.trim()) {
    throw new Error("Name is required!");
  }

  const projectRepository = AppDataSource.getRepository(Project);
  const userRepository = AppDataSource.getRepository(User);

  // 1) Verifica se o usuário já participa de algum projeto (ManyToMany -> precisa de JOIN)
  const existingUserProject = await projectRepository
    .createQueryBuilder("project")
    .innerJoin("project.users", "user")
    .where("user.id = :userId", { userId })
    .getOne();

  if (existingUserProject) {
    throw new Error("User already has a linked project!");
  }

  // 2) Busca o usuário para vincular na relação
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new Error("User not found!");
  }

  // 3) Cria o projeto e vincula o usuário logado na relação ManyToMany
  const newProject = projectRepository.create({
    name: name.trim(),
    description,
  });
  newProject.users = [user];

  await projectRepository.save(newProject);

  return {
    message: "Project created succesfully",
    projectId: newProject.id,
    name: newProject.name,
    description: newProject.description,
  };
}
