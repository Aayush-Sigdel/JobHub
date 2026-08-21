package com.example.jobhub.service.task.programming

import com.example.jobhub.dto.CreateProgrammingTask
import com.example.jobhub.dto.ProgrammingTaskDto
import com.example.jobhub.dto.ProgrammingTestCase
import com.example.jobhub.dto.SubmitTask
import com.example.jobhub.dto.TaskSubmissionResponse
import com.example.jobhub.exception.ApiException
import com.example.jobhub.mapper.TaskMapper
import com.example.jobhub.mapper.TaskSubmissionMapper
import com.example.jobhub.model.task.DataType
import com.example.jobhub.model.task.ProgrammingTask
import com.example.jobhub.model.task.TaskScope
import com.example.jobhub.model.task.TaskSubmission
import com.example.jobhub.model.task.TaskType
import com.example.jobhub.repository.ProgrammingTaskRepository
import com.example.jobhub.repository.TaskSubmissionRepository
import com.example.jobhub.repository.UserRepository
import com.example.jobhub.service.task.TaskExecutionService
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.util.UUID

@Service
class ProgrammingTaskService(
    private val taskRepository: ProgrammingTaskRepository,
    private val taskSubmissionRepository: TaskSubmissionRepository,
    private val judgeService: ProgrammingJudgeService,
    private val taskMapper: TaskMapper,
    private val taskSubmissionMapper: TaskSubmissionMapper,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper
): TaskExecutionService {

    override val taskType = TaskType.PROGRAMMING
    private val minimumTaskCasesRequired = 5
    private val maximumExampleTestCases = 3

    fun createTask(userId: UUID, createTask: CreateProgrammingTask): ProgrammingTaskDto{
        validateIdentifier(createTask.methodName, "methodName")
        createTask.parameters.forEach { validateIdentifier(it.name, "parameter name") }
        val duplicateNames = createTask.parameters
            .map { it.name }
            .groupBy { it }
            .filter { it.value.size > 1 }

        if (duplicateNames.isNotEmpty()) {
            throw ApiException("Duplicate parameter names: ${duplicateNames.keys}", HttpStatus.BAD_REQUEST)
        }
        if (createTask.testCases.size < minimumTaskCasesRequired) {
            throw ApiException("Task must have minimum $minimumTaskCasesRequired test cases", HttpStatus.BAD_REQUEST)
        }
        createTask.testCases.forEachIndexed { i, tc ->
            if (tc.input.size != createTask.parameters.size) {
                throw ApiException(
                    "Test case $i has ${tc.input.size} input values but method expects ${createTask.parameters.size}",
                    HttpStatus.BAD_REQUEST
                )
            }
            tc.input.forEachIndexed { j, node ->
                validateNodeDataType(node, createTask.parameters[j].type, "Test case $i, input[$j]")
            }
            validateNodeDataType(tc.expectedOutput, createTask.returnType, "Test case $i, expectedOutput")
        }
        val task = ProgrammingTask(
            createTask.title,
            createTask.instruction,
            createTask.skillLevel,
            createTask.scope,
            createTask.methodName,
            createTask.parameters,
            createTask.returnType,
            createTask.orderInsensitiveOutput,
            objectMapper.writeValueAsString(createTask.testCases),
            user(userId)
        )
        return taskMapper.toProgrammingTaskDto(
            taskRepository.save(task),
            maximumExampleTestCases
        )
    }

    override fun submitTask(userId: UUID, submitTask: SubmitTask): TaskSubmissionResponse {
        val task = task(submitTask.taskId)
        if (submitTask.code == null) {
            throw ApiException("The 'code' field should be present while submitting this task", HttpStatus.BAD_REQUEST)
        }
        if (submitTask.language == null) {
            throw ApiException("The 'language' field should be present while submitting this task", HttpStatus.BAD_REQUEST)
        }
        val testCases: List<ProgrammingTestCase> = objectMapper.readValue(
            task.testCasesJson,
            objectMapper.typeFactory.constructCollectionType(List::class.java, ProgrammingTestCase::class.java)
        )
        val totalTestCases = testCases.size
        val results = try {
            judgeService.judge(task, submitTask.code, submitTask.language, testCases)
        } catch (e: Exception) {
            return TaskSubmissionResponse(
                taskId = task.id,
                taskType = taskType,
                passed = false,
                achievedScore = 0.0,
                requiredScore = totalTestCases.toDouble(),
                message = e.message
            )
        }
        val passedCount = results.count { it.passed }
        val taskSubmission = TaskSubmission(
            task.id,
            taskType,
            submitTask.code,
            passedCount == totalTestCases,
            passedCount.toDouble(),
            totalTestCases.toDouble(),
            user(userId)
        )
        return taskSubmissionMapper.toTaskSubmissionResponse(
            taskSubmissionRepository.save(taskSubmission)
        )
    }

    fun getTasks(userId: UUID): List<ProgrammingTaskDto> {
        return taskMapper.toProgrammingTaskDto(
            taskRepository.findAllByCreatedById(userId),
            maximumExampleTestCases
        )
    }

    fun getAllTasks(userId: UUID): List<ProgrammingTaskDto> {
        return taskMapper.toProgrammingTaskDto(
            taskRepository.findAllByCreatedByIdOrScope(userId, TaskScope.PUBLIC),
            maximumExampleTestCases
        )
    }

    private fun validateIdentifier(name: String, item: String) {
        val identifierPattern = Regex("^[A-Za-z_][A-Za-z0-9_]*$")
        if (!identifierPattern.matches(name)) {
            throw ApiException("$item '$name' is not a valid identifier", HttpStatus.BAD_REQUEST)
        }
    }

    private fun validateNodeDataType(node: JsonNode, type: DataType, item: String) {
        val valid = when (type) {
            DataType.DOUBLE -> node.isNumber
            DataType.STRING -> node.isString
            DataType.BOOLEAN -> node.isBoolean
            DataType.INT -> node.isNumber
            DataType.INT_ARRAY -> node.isArray && node.all { it.isIntegralNumber }
            DataType.STRING_ARRAY -> node.isArray && node.all { it.isString }
        }
        if (!valid) throw ApiException("$item does not match declared type $type", HttpStatus.BAD_REQUEST)
    }

    private fun user(userId: UUID) = userRepository.findById(userId)
        .orElseThrow { ApiException("User not found", HttpStatus.NOT_FOUND) }

    private fun task(taskId: UUID) = taskRepository.findById(taskId)
        .orElseThrow { ApiException("Task not found", HttpStatus.NOT_FOUND) }
}