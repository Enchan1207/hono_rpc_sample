import type { Task } from '@/entities/task'

/** Repositoryレイヤのエラー */
export class RepositoryError extends Error {}

/** ネットワークエラー */
export class NetworkError extends RepositoryError {}

// MARK: Task

/** Taskリポジトリのエラー */
export class TaskRepositoryError extends RepositoryError {}

/** 指定されたIDのタスクは存在しない */
export class NoSuchItemError extends TaskRepositoryError {
  id: Task['id']

  constructor(id: Task['id']) {
    super(`No such item with id ${id}`)
    this.id = id
  }
}
