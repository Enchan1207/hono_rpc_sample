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

  constructor(message: string, id: Task['id']) {
    super(message)
    this.id = id
  }
}
