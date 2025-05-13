package tara.tb1.pw.Security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration class SecurityConfig(@Value("\${security.api-key}") val apiKey: String)
