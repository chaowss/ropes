# Written Questions

## Scrappy Building: Cheating Detection in One Week

### The Challenge
Adding cheating detection for a client demo with a one-week deadline and no existing tools requires a pragmatic, MVP-first approach that balances speed with effectiveness.

### Detection Strategy

**Phase 1: Immediate Wins (Days 1-3)**
1. **Time-based Analysis**
   - Track time spent on each question (too fast = suspicious)
   - This can be done via how many standard deviations away from the mean
   - Flag submissions completed in unrealistic timeframes
   - Monitor tab-away events and return patterns

2. **Behavioral Fingerprinting**
   - Mouse movement patterns (humans have natural variance)
   - Keystroke timing and patterns
   - Click-to-answer delays (bots are often too consistent)

3. **Browser Environment Detection**
   - Screen resolution and device fingerprinting
   - Detect automation tools (Selenium, Puppeteer indicators)
   - Flag unusual browser configurations

**Phase 2: Pattern Recognition (Days 4-5)**
1. **Answer Pattern Analysis**
   - Statistical outliers in answer sequences
   - Identical mistake patterns across candidates
   - Unusual confidence distributions

2. **Network-based Detection**
   - Multiple submissions from same IP within short timeframes
   - Geolocation inconsistencies
   - VPN/proxy detection

**Phase 3: Integration & Testing (Days 6-7)**
1. **Scoring Algorithm**
   - Weighted risk scoring combining multiple signals
   - Configurable thresholds for different risk tolerance
   - Clear flagging system for manual review

2. **Dashboard Integration**
   - Visual indicators in results review
   - Detailed suspicious activity reports
   - Exportable audit trails for compliance

### Implementation Approach

**Technical Stack:**
- Frontend: JavaScript event listeners for behavioral tracking
- Backend: Real-time analytics processing with Redis for session data
- Database: New tables for tracking events and risk scores

**MVP Philosophy:**
- Start with high-confidence, low-false-positive detections
- Build modular system allowing rapid iteration on detection rules
- Focus on deterrence effect rather than perfect detection
- Implement logging for post-demo analysis and improvement

**Quality Assurance:**
- A/B test with known clean submissions
- Simulate common cheating scenarios internally
- Set conservative thresholds initially to avoid false positives
- Plan for manual review workflow for edge cases

### Why This Approach Works

1. **Fast Time-to-Value:** Core detection can be implemented in 2-3 days
2. **Iterative Improvement:** Each detection method can be refined independently
3. **Client Demo Ready:** Visual indicators and reports provide clear value demonstration
4. **Foundation for Growth:** Modular architecture supports adding ML/AI detection later

The key is shipping something that works reliably rather than something perfect. The goal is to catch obvious cheating attempts while building a platform for more sophisticated detection.

---

## System Design: Balancing Technical Debt, Scalability, and Feature Velocity

### Core Philosophy: "Intentional Technical Debt"

In a fast-growing startup, technical debt isn't inherently bad—it's a tool. The key is making conscious trade-offs rather than accumulating debt accidentally.

### The Three-Horizon Framework

**Horizon 1: Immediate (0-3 months)**
- **Principle:** Ship fast, measure impact, iterate
- **Technical Approach:** Accept tactical debt for speed, but instrument everything
- **Example:** Use simple JSON file storage for MVP, but log all access patterns
- **Rationale:** Customer validation is more important than perfect architecture

**Horizon 2: Scaling (3-12 months)**
- **Principle:** Strategic refactoring based on proven user needs
- **Technical Approach:** Replace bottlenecks with data-driven decisions
- **Example:** Migrate to PostgreSQL when file system shows clear performance issues
- **Rationale:** Optimize what users actually use, not what you think they'll use

**Horizon 3: Platform (12+ months)**
- **Principle:** Build for scale and maintainability
- **Technical Approach:** Systematic debt reduction and architectural evolution
- **Example:** Microservices architecture, event sourcing, advanced caching
- **Rationale:** Sustainable long-term growth requires solid foundations

### Decision Framework

**For New Features:**
1. **Impact vs. Effort Matrix:** High-impact, low-effort features get tactical implementations
2. **Reversibility:** Prefer decisions that can be easily changed later
3. **Data Collection:** Every feature should generate insights for future optimization

**For Technical Debt:**
1. **User-Facing Impact:** Fix debt that directly affects user experience first
2. **Developer Velocity:** Address debt that slows down the team's ability to ship
3. **Risk Assessment:** Prioritize debt that could cause system failures

**For Performance Issues:**
1. **Measure First:** Never optimize without data
2. **80/20 Rule:** Focus on the 20% of optimizations that solve 80% of problems
3. **User Experience:** Perceived performance often matters more than actual performance

### Practical Implementation

**Team Structure:**
- 70% feature development
- 20% technical debt reduction
- 10% exploration/innovation

**Process Guidelines:**
- Every sprint includes at least one debt reduction task
- Performance budgets for critical user journeys
- Regular "architecture decision records" to document trade-offs

**Metrics That Matter:**
- Time to deploy (developer velocity)
- Error rates (system reliability)
- Page load times (user experience)
- Feature adoption rates (product-market fit)

### Case Study: Assessment Platform Growth

**Month 1-3:** JSON file storage, monolithic architecture
- **Rationale:** Prove the concept, understand user needs
- **Debt Incurred:** Non-scalable storage, tight coupling

**Month 4-6:** Database migration, API optimization
- **Trigger:** File system becoming bottleneck at 1000+ assessments
- **Approach:** Incremental migration with feature flags

**Month 7-12:** Microservices for assessment engine, advanced analytics
- **Trigger:** Multiple teams working on different features
- **Approach:** Extract services based on team boundaries and scaling needs

### Key Principles

1. **Debt is a Tool:** Use it strategically to accelerate learning and growth
2. **Data-Driven Decisions:** Never guess about performance or user needs
3. **Incremental Evolution:** Big-bang rewrites rarely work in startups
4. **Team Sustainability:** Technical decisions should support team growth and happiness
5. **Customer First:** All technical decisions should ultimately serve user value

The goal isn't perfect code—it's sustainable growth that delivers continuous value to users while maintaining team velocity and system reliability. 