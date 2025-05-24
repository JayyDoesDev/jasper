package tara.tb1.pw.Security

import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.filter.GenericFilterBean

class ApiKeyFilter(private val securityConfig: SecurityConfig) : GenericFilterBean() {

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpRequest = request as HttpServletRequest
        val httpResponse = response as HttpServletResponse

        val apiKeyHeader = httpRequest.getHeader("X-API-KEY")

        if (apiKeyHeader != securityConfig.apiKey) {
            httpResponse.status = HttpServletResponse.SC_UNAUTHORIZED
            httpResponse.writer.write("Invalid API Key")
            return
        }

        chain.doFilter(request, response)
    }
}
