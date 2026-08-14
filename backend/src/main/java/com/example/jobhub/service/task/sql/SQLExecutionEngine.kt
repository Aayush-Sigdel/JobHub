package com.example.jobhub.service.task.sql

import org.springframework.stereotype.Component
import java.sql.Connection
import java.sql.DriverManager
import java.util.UUID
import kotlin.use

data class AssertionResult(
    val assertion: String,
    val passed: Boolean,
    val error: String? = null
)

@Component
class SQLExecutionEngine {

    fun run(
        setupQueries: List<String>,
        solutionQueries: List<String>,
        assertions: List<String>
    ): List<AssertionResult> {
        val url = "jdbc:h2:mem:task_${UUID.randomUUID()}"
        DriverManager.getConnection(url, "sa", "").use { connection ->
            // Execute initial queries to setup the environment
            connection.createStatement().use { stmt ->
                setupQueries.forEach { stmt.execute(it) }
            }
            // Execute solution queries
            runSolutionQueries(connection, solutionQueries)
            // Execute and return assertion results
            return assertions.map { runAssertion(connection, it) }
        }
    }

    private fun runSolutionQueries(conn: Connection, candidateQueries: List<String>) {
        conn.createStatement().use { stmt ->
            stmt.queryTimeout = 5
            var selectCount = 0

            candidateQueries.forEach { raw ->
                val query = stripSemicolon(raw)
                if (isSelectStatement(query)) {
                    selectCount++
                    val tableName = if (selectCount == 1) "candidate_result" else "candidate_result_$selectCount"
                    stmt.execute("CREATE TABLE $tableName AS $query")
                } else {
                    stmt.execute(query)
                }
            }
        }
    }

    private fun runAssertion(conn: Connection, assertion: String): AssertionResult {
        val body = stripSemicolon(assertion)
        return try {
            conn.createStatement().use { stmt ->
                stmt.queryTimeout = 5
                stmt.executeQuery("SELECT ($body) AS result").use { rs ->
                    val passed = rs.next() && rs.getBoolean("result")
                    AssertionResult(assertion, passed)
                }
            }
        } catch (e: Exception) {
            AssertionResult(assertion, false, e.message)
        }
    }

    private fun stripSemicolon(sql: String): String = sql.trim().removeSuffix(";")

    private fun isSelectStatement(sql: String): Boolean {
        val normalized = sql.trim().uppercase()
        return normalized.startsWith("SELECT") || normalized.startsWith("WITH") // WITH = CTE
    }
}