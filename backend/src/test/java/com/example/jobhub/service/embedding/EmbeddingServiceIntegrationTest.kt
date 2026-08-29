package com.example.jobhub.service.embedding

import com.example.jobhub.client.EmbeddingApiClient
import com.example.jobhub.service.social.DevtoService
import com.example.jobhub.service.social.GithubService
import com.example.jobhub.service.social.OrcidService
import com.example.jobhub.service.social.PortfolioService
import com.example.jobhub.service.social.StackoverflowService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import kotlinx.coroutines.test.runTest

@SpringBootTest
class EmbeddingServiceIntegrationTest{

    @Autowired
    private lateinit var githubService: GithubService

    @Autowired
    private lateinit var githubEmbeddingService: GithubEmbeddingService

    @Autowired
    private lateinit var orcidService: OrcidService

    @Autowired
    private lateinit var orcidEmbeddingService: OrcidEmbeddingService

    @Autowired
    private lateinit var stackoverflowService: StackoverflowService

    @Autowired
    private lateinit var stackoverflowEmbeddingService: StackoverflowEmbeddingService

    @Autowired
    private lateinit var portfolioService: PortfolioService

    @Autowired
    private lateinit var portfolioEmbeddingService: PortfolioEmbeddingService

    @Autowired
    private lateinit var devToService: DevtoService

    @Autowired
    private lateinit var devToEmbeddingService: DevtoEmbeddingService

    @Autowired
    private lateinit var embeddingApiClient: EmbeddingApiClient

    private val SENIOR_BACKEND_JOB_DESCRIPTION = "We are looking for a Senior Backend Engineer to join our Core Platform team. You will be responsible for designing, developing, and maintaining high-performance APIs and microservices that power our banking integration platform. You will work closely with product managers, frontend engineers, and financial institution partners to deliver reliable, scalable solutions that process millions of transactions daily.\n" +
            "\n" +
            "What You’ll Do\n" +
            "\n" +
            "Design and implement RESTful APIs and event-driven microservices using Node.js, Go, or Java\n" +
            "Build and optimize core banking integration layers for real-time transaction processing\n" +
            "Collaborate with cross-functional teams to define technical requirements and architecture\n" +
            "Ensure high availability and fault tolerance of mission-critical financial systems\n" +
            "Conduct code reviews, mentor junior engineers, and drive engineering best practices\n" +
            "Participate in on-call rotations and incident response for production systems\n" +
            "\n" +
            "What We’re Looking For\n" +
            "\n" +
            "5+ years of experience in backend software engineering\n" +
            "Strong proficiency in at least one of: Node.js, Go, Java, or Python\n" +
            "Experience with distributed systems, microservices architecture, and message queues\n" +
            "Solid understanding of relational and NoSQL databases (PostgreSQL, MongoDB, Redis)\n" +
            "Familiarity with cloud platforms (AWS, GCP, or Azure) and containerization (Docker, Kubernetes)\n" +
            "Experience with CI/CD pipelines and infrastructure as code"

    private val MACHINE_LEARNING_ENGINEER_JOB_DESCRIPTION = "We're hiring Mid and Senior Data Scientists / ML Engineers to help us build the next generation of intelligent, agentic systems that solve real business problems. At this level, you'll own problems end-to-end: scoping ambiguous business questions with AI Leads, choosing the right modeling approach (classical ML, foundation models, or agentic architectures), shipping to production, and iterating based on real-world signals. Senior candidates will additionally shape technical direction, mentor others, and raise the bar for how the team uses modern AI tooling.\n" +
            "\n" +
            "Whether your depth is in NLP, Computer Vision, Multimodal systems, or classical ML, what we care about is your ability to reason from first principles, leverage modern AI tools to multiply your output, and turn ambiguous problems into shipped systems that move the business.\n" +
            "\n" +
            "Core Responsibilities\n" +
            "\n" +
            "Own ML projects end-to-end - from problem framing and data exploration through modeling, deployment, monitoring, and iteration. \n" +
            "Design and ship production ML systems spanning churn and propensity modeling, demand forecasting, anomaly detection, pricing optimization, and recommendation - using the right tool for the job, whether that's a gradient-boosted model, a fine-tuned foundation model, or an agent-based workflow\n" +
            "Build agentic AI workflows that automate decision-making across the business - including multi-agent systems, tool-using agents, and human-in-the-loop pipelines that combine LLM reasoning with deterministic logic and traditional ML\n" +
            "Leverage modern AI development tooling (AI coding assistants, agentic IDEs, automated evaluation harnesses, MLOps platforms) as a core part of your engineering practice - not an afterthought\n" +
            "Apply foundation models and domain-specific ML to extract signals from structured data, text, images, audio, or multimodal inputs depending on the problem at hand\n" +
            "Design rigorous evaluations for both deterministic models and probabilistic AI systems - offline metrics, online A/B tests, LLM-as-judge frameworks, and regression suites for non-deterministic outputs\n" +
            "Partner with data and platform engineers to build robust pipelines, feature stores, and serving infrastructure supporting both classical ML and modern AI workloads\n" +
            "Communicate effectively with technical and non-technical stakeholders - translating model behavior, tradeoffs, and risks into decisions the business can act on\n" +
            "(Senior) Set technical direction for an area of the ML stack, mentor mid-level and junior engineers, lead design reviews, and influence the team's tooling, evaluation standards, and architectural choices\n" +
            "\n" +
            "Technical Requirements\n" +
            "\n" +
            "Bachelor's or Master's degree in Computer Science, Mathematics, Statistics, or a related quantitative field - or equivalent practical experience\n" +
            "3+ years of applied data science / ML experience with a track record of shipping models to production. (Senior: 5+ years) including ownership of complex systems and demonstrable technical leadership\n" +
            "Strong programming proficiency in Python, including modern ML/AI libraries (PyTorch or JAX, scikit-learn, Hugging Face, pandas etc.)\n" +
            "Solid grounding in statistical modeling, experimentation, and classical ML - regression, tree-based methods (Random Forest, XGBoost, LightGBM), time series forecasting, and anomaly detection\n" +
            "Hands-on experience with at least one specialty area: NLP and LLMs, Computer Vision, or Multimodal systems. We're domain-agnostic - depth in any of these is valued\n" +
            "Practical experience working with foundation models and LLM APIs - prompt design, structured outputs, function calling, retrieval-augmented generation (RAG), and fine-tuning where appropriate\n" +
            "Comfort with modern AI development workflows - using AI coding assistants and agentic IDEs (Claude Code, Cursor, Copilot, or similar) as a daily part of your engineering practice\n" +
            "Experience with data engineering fundamentals and big-data tooling such as PySpark, Databricks, or equivalent distributed compute frameworks\n" +
            "Familiarity with MLOps and LLMOps practices - version control for models and prompts, experiment tracking, CI/CD for ML, monitoring, and evaluation pipelines\n" +
            "(Senior) Demonstrated ability to make architectural decisions, navigate ambiguity, and influence cross-functional partners on technical strategy\n"


    @Test
    fun compareGithubEmbeddings() = runTest {
        val profile1 = githubService.fetch("sugham019")

        val embeddings1 = githubEmbeddingService.generateEmbeddings(profile1)
        val embeddings2 = embeddingApiClient.embed(MACHINE_LEARNING_ENGINEER_JOB_DESCRIPTION)

        val similarity = CosineSimilarity.compute(embeddings1, embeddings2)
        println("Cosine similarity: $similarity")
    }

    @Test
    fun compareOrcidEmbeddings() = runTest{
        val profile1 = orcidService.fetch("0000-0001-8314-8497")

        val embeddings1 = orcidEmbeddingService.generateEmbeddings(profile1)
        val embeddings2 = embeddingApiClient.embed(SENIOR_BACKEND_JOB_DESCRIPTION)

        val similarity = CosineSimilarity.compute(embeddings1, embeddings2)
        println("Cosine similarity: $similarity")
    }

    @Test
    fun compareStackoverflowEmbeddings() = runTest{
        val profile1 = stackoverflowService.fetch("1808924")

        val embeddings1 = stackoverflowEmbeddingService.generateEmbeddings(profile1)
        val embeddings2 = embeddingApiClient.embed(MACHINE_LEARNING_ENGINEER_JOB_DESCRIPTION)

        val similarity = CosineSimilarity.compute(embeddings1, embeddings2)
        println("Cosine similarity: $similarity")
    }

    @Test
    fun comparePortfolioEmbeddings() = runTest{
        val profile1 = portfolioService.fetch("https://www.aayushsigdel.com.np/")
        val profile2 = portfolioService.fetch("https://bikram-bk.com.np/")

        val embeddings1 = portfolioEmbeddingService.generateEmbeddings(profile1)
        val embeddings2 = embeddingApiClient.embed(MACHINE_LEARNING_ENGINEER_JOB_DESCRIPTION)

        val similarity = CosineSimilarity.compute(embeddings1, embeddings2)
        println("Cosine similarity: $similarity")
    }

    @Test
    fun compareDevToEmbeddings() = runTest {
        val profile1 = devToService.fetch("ultimate_coder")

        val embeddings1 = devToEmbeddingService.generateEmbeddings(profile1)
        val embeddings2 = embeddingApiClient.embed(MACHINE_LEARNING_ENGINEER_JOB_DESCRIPTION)

        val similarity = CosineSimilarity.compute(embeddings1, embeddings2)
        println("Cosine similarity: $similarity")
    }
}