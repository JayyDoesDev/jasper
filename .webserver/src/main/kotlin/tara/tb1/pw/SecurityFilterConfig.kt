package tara.tb1.pw.Security

import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FilterConfig {

    @Bean
    fun apiKeyFilter(securityConfig: SecurityConfig): FilterRegistrationBean<ApiKeyFilter> {
        val registration = FilterRegistrationBean(ApiKeyFilter(securityConfig))
        registration.addUrlPatterns("/fun/*", "/playwright/*")
        return registration
    }
}
