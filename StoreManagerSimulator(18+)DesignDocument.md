# Store Manager Simulator (18+)

A fully AI-generated, sandbox-style store management simulation game created for Perchance. Every product, character, background, and interaction is dynamically generated in real time using text and image AI APIs.

---

## 🧱 1. Core Game Concept

**Player Role**: A new store owner trying to build a successful business from the ground up.

**Gameplay Loop**:

* Begin each day
* Serve customers (AI-generated scenes)
* Sell, negotiate, flirt, or handle drama
* Reorder or add new products
* Upgrade and expand your store
* Hire and schedule staff
* Track finances and relationships
* End the day and repeat

**Tone**: Realistic with humorous, sexy, and chaotic edge. 18+ scenes optional but fully supported.

**Content Philosophy**: "A game with porn in it, not a porn game" - Business simulation first, with earned adult content as natural relationship progression. Silly moments balance serious business decisions.

---

## ⚙️ 2. Game Setup Flow

### 2.1 Player Setup

* Choose Store Type (template or custom via prompt)
* Name your store
* Choose environment (default: City, optional: Rural, Suburban)
* Add product prompts or use suggested types
* Create your player character:

  * Name, age, gender
  * Detailed appearance
  * Optional AI profile pic (auto-generated or custom prompt)

### 2.2 AI Queue Generation (Background Process)

* Generate 30–40 NPCs with basic traits and archetypes
* Generate store background image
* Create product catalog (from templates or prompts)
* Begin fleshing out NPCs in the background

---

## 🧬 3. NPC System (Hybrid Generation)

### 3.1 Initial NPCs

* Name: Pulled from curated lists
* Archetype: Cash-strapped college kid, business mogul, nosy neighbor, etc.
* Basic traits: Age, gender, pronouns, spending power

### 3.2 Background AI Enrichment

* Full backstory
* Personality tags
* Visual prompt for profile pic
* Flaws, secrets, history with the player (if any)

### 3.3 On First Encounter

* NPC fully revealed
* Added to the NPC Registry
* All profile data editable by the player through the in-game computer

---

## 💻 4. Work Computer UI

The player’s workstation offers detailed simulation control and profile management.

### 4.1 NPC Profiles

* All known characters
* Editable bios, appearance, stats, prompt
* Track relationship levels and status

### 4.2 Product Manager

* View stock levels
* Reorder existing products
* Add new products via AI prompt
* View product trends and top sellers

### 4.3 Social Media Interface

* NPC-generated posts (dynamic flavor and context)
* Like, comment, DM
* Posts influence NPC perception and in-game events

### 4.4 Bank Page

* Shows current balance, rent, debts
* Logs all transactions: sales, purchases, staff pay
* Graphs for financial trends

### 4.5 Staff Scheduler

* Hireable NPCs
* Assign shifts
* Track productivity and morale
* Handle drama, events, or bonuses

---

## 📦 5. AI Content Types

| Content Type  | Source        | Timing                |
| ------------- | ------------- | --------------------- |
| Products      | AI (text+img) | Setup & on-demand     |
| NPCs          | Hybrid AI     | Setup & background    |
| Backgrounds   | AI (img)      | Setup & upgrades      |
| Dialogue      | AI (text)     | Real-time             |
| Events & News | AI (text)     | Random or triggered   |
| NSFW Scenes   | AI (text+img) | Conditional, optional |

---

## 📂 6. File Structure (Updated)

```plaintext
/src/
├── index.html
├── scripts/
│   ├── main.js
│   ├── aiHooks.js              // Handles Perchance plugin calls
│   ├── productSystem.js
│   ├── timeSystem.js
│   ├── npcSystem.js            // Handles NPC gen, names, archetypes, profile building
│   ├── conversationSystem.js   // Manages how interactions work
│   ├── checkoutSystem.js       // Handles the point-of-sale system
│   ├── workstationSystem/
│   │   ├── index.js            // Main workstation logic
│   │   ├── npcApp.js
│   │   ├── productApp.js
│   │   ├── socialApp.js
│   │   ├── bankApp.js
│   │   └── staffApp.js
│   ├── uiManager.js            // General UI scripts
│   ├── gameInitialization.js   // Handles game setup/start process
│   └── saveSystem.js           // Save/Load/Import/Export
├── styles/
│   ├── main.css
│   ├── computer.css
│   ├── counter.css
│   ├── conversation.css
│   ├── calendar.css
│   ├── apps/
│   │   ├── socialApp.css
│   │   ├── bankApp.css
│   │   └── staffApp.css
├── data/
│   ├── GameData.js             // Defines save state format
│   ├── nameLists.json
│   ├── archetypes.json
│   └── promptTemplates.json
├── assets/
│   └── generated/              // AI-generated images
├── gulpfile.js
```

---

## 🧭 7. Stretch Features

* Dynamic local weather + store foot traffic
* Customizable store layout / upgrades
* Black market product line (illegal, dangerous)
* Live stream tab (NPC reviews & influencer visits)
* Multiple store locations

---

## 💰 8. Player Progression & Victory Conditions

### 8.1 The Debt System
**Starting Scenario**: Player inherits a failing store with significant debt to:
- **Bank Loan**: $50,000 (3% monthly interest, structured payments)
- **Mob Debt**: $25,000 (No interest but... consequences for missing payments)
- **Supplier Credit**: $10,000 (Affects product availability if unpaid)

**Victory Conditions**:
- **Survival Goal**: Make weekly/monthly payments to avoid closure
- **Success Milestones**: Pay off debts, achieve consistent profitability
- **Mastery State**: Self-sufficient store with multiple revenue streams
- **No Hard "Win"**: Game becomes increasingly manageable until player feels accomplished

### 8.2 Progression Unlocks
**Tier 1** (Starting):
- Basic products, 1-2 staff max, minimal security
- Simple till, basic inventory system

**Tier 2** ($25K+ revenue):
- Expanded hiring (janitor, security guard)
- Product variety increases
- Basic store security (cameras, alarms)
- Social media management unlocked

**Tier 3** ($75K+ revenue):
- Premium product lines
- Store layout customization
- Advanced security systems
- Staff management tools

**Tier 4** ($150K+ revenue):
- Multiple store locations
- Specialized staff roles
- Black market opportunities
- Investment features (stocks/crypto)

---

## 🎭 9. Relationship & Drama System

### 9.1 Relationship Categories
**Customer Loyalty Levels**:
- **Stranger** (0-20): Basic interactions, standard prices
- **Regular** (21-50): Small talk, minor discounts, reliable sales
- **Friend** (51-80): Personal conversations, bulk purchases, referrals
- **VIP** (81-100): Premium treatment, exclusive access, major purchases

**Romance Levels**:
- **Interested** (30-60): Flirtation, longer conversations
- **Dating** (61-80): After-hours meetups, relationship drama
- **Partner** (81-100): Living together, joint finances, business decisions

**Staff Relationships**:
- **Employee** (0-40): Professional only, basic performance
- **Trusted** (41-70): Reliable, can handle complex tasks
- **Family** (71-100): Loyal, covers for you, exceptional performance

### 9.2 Relationship Consequences
**Positive Effects**:
- High customer loyalty = 15-30% more frequent visits
- Romance = potential business partner/investor
- Trusted staff = reduced theft, better customer service

**Negative Effects**:
- Bad relationships = negative reviews, decreased foot traffic
- Messy breakups = drama affecting store atmosphere
- Disgruntled staff = theft, poor service, walkouts

### 9.3 18+ Content Integration
**Earned Intimate Scenes**:
- Requires relationship level 60+ and appropriate dialogue choices
- Can happen after hours, during breaks, or special events
- **Mechanical Impact**: Partner relationships can lead to business investments, staff recommendations, or customer referrals
- **Reputation Risk**: Public scandals can affect store reputation
- **Staff Complications**: Dating employees creates workplace drama

---

## 💸 10. Economic Complexity System

### 10.1 Supply & Demand Mechanics
**Product Categories with Fluctuating Demand**:
- **Seasonal Items**: Swimwear in summer, coats in winter
- **Event-Driven**: Sports gear during championships, party supplies on weekends
- **Trend-Based**: Fashion items, tech gadgets, viral products
- **Emergency Demand**: Umbrellas during rain, batteries during outages

**Dynamic Pricing**:
- Market forces affect wholesale costs
- Competition nearby affects pricing flexibility
- Customer loyalty affects price tolerance
- Staff recommendations influence sales success

### 10.2 Investment Mini-Game
**5 Investment Options** (Updated Daily):
- **TechCorp Stock**: High volatility, tech trend dependent
- **RetailChain Inc**: Stable, inversely related to your success
- **CryptoCoin**: Extremely volatile, meme-driven
- **LocalBank Bonds**: Low risk, steady returns
- **CommodityFund**: Tied to product costs (coffee, electronics, etc.)

**Investment Mechanics**:
- Use profits to buy shares/coins
- Daily market updates via in-game news
- Can cash out anytime but with transaction fees
- Major wins/losses affect available cash for store operations

---

## ⚠️ 11. Conflict & Challenge Systems

### 11.1 Crime & Security
**Theft Types**:
- **Shoplifting**: Customers stealing small items (cameras reduce by 60%)
- **Employee Theft**: Staff stealing cash/products (background checks help)
- **Burglary**: After-hours break-ins (alarms + security guard prevent)
- **Robbery**: Armed theft during business hours (security guard deters)

**Security Solutions**:
- **Basic Cameras**: $2,000, reduce shoplifting
- **Alarm System**: $3,000, prevent burglary
- **Security Guard**: $50/day, deters all crime types
- **Background Checks**: $100/hire, prevent employee theft

### 11.2 Debt Collection Drama
**Bank Consequences** (3+ missed payments):
- Higher interest rates
- Asset seizure threats
- Credit rating damage

**Mob Consequences** (2+ missed payments):
- "Friendly visits" that scare customers
- Vandalism to store property
- Physical threats to player character
- Protection racket escalation

### 11.3 Difficult Customers
**Problem Customer Types**:
- **Karens**: Demand manager, threaten reviews, cause scenes
- **Scammers**: Fake returns, counterfeit money, credit card fraud
- **Drunks**: Disruptive behavior, potential damage
- **Influencers**: Demand free products for "exposure"

**Resolution Options**:
- Diplomatic (relationship building)
- Firm boundaries (reputation maintenance)
- Call security (if hired)
- Ban from store (lose future sales)

---

## 👥 12. Enhanced Staff System

### 12.1 Staff Roles & Responsibilities
**Cashier** ($40/day):
- Handles transactions when player is busy
- Customer service affects store reputation
- Can be trained to upsell

**Janitor** ($30/day):
- Maintains store cleanliness (affects customer experience)
- Works during off-hours or slow periods
- Discovers evidence of break-ins

**Stocker** ($35/day):
- Restocks shelves automatically
- Manages inventory organization
- Can suggest reorder quantities

**Security Guard** ($50/day):
- Deters all crime types
- Handles difficult customers
- Can work nights for burglary prevention

**Assistant Manager** ($60/day):
- Can run store independently for short periods
- Handles staff scheduling conflicts
- Makes minor business decisions

### 12.2 Staff Personality & Performance
**Performance Factors**:
- **Reliability**: Shows up on time, follows instructions
- **Charisma**: Affects customer interactions positively/negatively
- **Honesty**: Determines theft likelihood
- **Competence**: Affects task completion quality

**Staff Drama Examples**:
- Romance between employees affecting productivity
- Theft accusations requiring investigation
- Personality conflicts affecting team morale
- Personal problems affecting attendance

**Staff Benefits System**:
- Bonuses for good performance
- Paid time off for loyalty
- Training programs to improve skills
- Profit sharing for long-term employees

---

## ✅ 13. Refined Next Planning Steps

1. **AI Prompt Templates**: Create detailed prompts for NPCs, products, and scenarios
2. **Stat System Design**: Define all numerical systems (relationships, finances, performance)
3. **Event Trigger Framework**: Map out when and how random events occur
4. **UI/UX Wireframes**: Detailed mockups of all interfaces
5. **Balancing Spreadsheet**: Economic models and progression curves
6. **Content Moderation System**: Guidelines for AI-generated adult content
7. **Save System Architecture**: How to preserve complex game state
8. **Tutorial Flow**: Onboarding for complex systems

---

## 🎮 14. Daily Operations & Player Agency Balance

### 14.1 Core Daily Tasks (Player Can Do Everything)
**Essential Store Operations**:
- **Customer Service**: Greet, assist, checkout customers manually
- **Inventory Management**: Check stock, reorder products, price items
- **Store Maintenance**: Clean floors, organize shelves, empty trash
- **Financial Tasks**: Count register, update books, pay bills
- **Security Monitoring**: Watch for theft, handle incidents
- **Staff Coordination**: Schedule shifts, resolve conflicts, train employees

**Time Cost Without Staff**:
- Manual checkout: 3-5 minutes per customer
- Cleaning: 30 minutes daily
- Inventory check: 45 minutes daily
- Financial tasks: 20 minutes daily
- **Total**: 2-3 hours of mandatory daily tasks

### 14.2 Automation Through Hiring
**Cashier Impact**:
- Handles 80% of routine transactions
- Player focuses on complex sales, relationships
- Reduces daily time commitment by 60%

**Janitor Impact**:
- Automated cleaning maintains store appeal
- Player saves 30 minutes daily
- Prevents customer complaints about mess

**Stocker Impact**:
- Automatic inventory management
- Suggests reorders based on sales trends
- Player saves 45 minutes daily

**Security Guard Impact**:
- Handles theft prevention automatically
- Deals with difficult customers
- Player can focus on positive interactions

**Assistant Manager Impact**:
- Can run store for 2-4 hours independently
- Player can leave for personal time/relationships
- Handles routine staff issues

### 14.3 The Delegation Dilemma
**Pros of Self-Management**:
- 100% profit retention (no staff wages)
- Complete control over customer interactions
- Direct relationship building with all customers
- Higher customer satisfaction (owner attention)

**Pros of Staff Delegation**:
- More time for strategic decisions
- Ability to pursue relationships/social activities
- Reduced stress and burnout
- Scalability for multiple locations

**The Sweet Spot**: Hybrid approach where player handles VIP customers and relationship building while staff manages routine operations.

---

## 🎭 15. Tone & Content Guidelines

### 15.1 Humor Style
**Silly Moments**:
- NPCs with ridiculous quirks (obsessed with rubber ducks, speaks only in movie quotes)
- Absurd product requests ("Do you sell unicorn tears?")
- Staff mishaps (accidentally ordering 500 bananas instead of 50)
- Social media drama over trivial store policies

**Serious Elements**:
- Debt pressure creates genuine stress
- Staff personal problems require empathy
- Business decisions have real consequences
- Character relationships develop authentically

### 15.2 Adult Content Integration
**Natural Progression**:
- **Level 1**: Mild flirtation during transactions
- **Level 2**: Suggestive comments, after-hours conversations
- **Level 3**: Private meetings, relationship discussions
- **Level 4**: Intimate encounters with story context
- **Level 5**: Full adult scenes with emotional weight

**Player-Driven Escalation**:
- Player must choose flirtatious dialogue options
- Relationship level gates content naturally
- Always optional - business-only routes available
- Consequences for workplace relationships

**Business Integration**:
- Partner customers become investors/advocates
- Office romances affect staff dynamics
- Reputation risks from public scandals
- Relationship gifts/gestures cost money but build loyalty

### 15.3 Content Boundaries
**No Limits on Explicitness**:
- AI can generate any level of adult content player pursues
- Player choices determine content intensity
- Safety warnings for extreme content paths

**Contextual Appropriateness**:
- Adult content requires private settings
- Public scenes remain business-appropriate
- Staff relationships have professional complications

---

## ⚡ 16. Task Automation vs. Personal Touch

### 16.1 Customer Interaction Depth
**Player-Served Customers**:
- Full conversation trees available
- Relationship building opportunities
- Negotiation and upselling chances
- Memorable character moments
- Higher satisfaction scores

**Staff-Served Customers**:
- Basic transaction completion
- Limited relationship progression
- Occasional staff-reported highlights
- Faster throughput but less personal

### 16.2 Quality vs. Efficiency Trade-offs
**Manual Operations** (High Quality, Time-Intensive):
- Perfect inventory organization
- Optimal pricing decisions
- Maximum customer satisfaction
- Complete financial control

**Automated Operations** (High Efficiency, Lower Quality):
- Good enough inventory management
- Standard pricing strategies
- Adequate customer service
- Delegated financial tasks

### 16.3 Strategic Decision Points
**Early Game** (Limited Cash):
- Player does everything manually
- Learns all systems intimately
- High time investment, low efficiency
- Personal connection with every customer

**Mid Game** (Growing Business):
- Selective staff hiring for pain points
- Hybrid management approach
- Balancing cost vs. time savings
- Focus on high-value relationships

**Late Game** (Established Business):
- Full staff delegation of routine tasks
- Player as strategic manager
- Focus on expansion and relationships
- Minimum time investment for maximum profit

---

## 🎯 17. Engagement Hooks & Retention

### 17.1 Daily Variety Generators
**Random Events** (AI-Generated):
- Surprise health inspections
- Celebrity customer visits
- Viral social media mentions
- Supplier delivery problems
- Staff personal emergencies

**Seasonal Content**:
- Holiday shopping rushes
- Weather-related demand spikes
- Community events affecting traffic
- Annual business challenges

**Relationship Drama**:
- Love triangles between NPCs
- Ex-partners causing workplace tension
- Customer jealousy over attention
- Staff romance complications

### 17.2 Long-Term Goals
**Business Milestones**:
- Debt-free operation
- First profitable month
- Staff team of 5+ employees
- Store renovation completion
- Multiple location ownership

**Personal Achievements**:
- Marry a regular customer
- Convert enemy to friend
- Perfect store reputation
- Social media influencer status
- Community leader recognition

### 17.3 Replay Value
**Different Store Types**:
- Corner convenience store
- Upscale boutique
- Adult novelty shop
- Electronics retailer
- Each with unique challenges/customers

**Varied Starting Scenarios**:
- Different debt situations
- Various neighborhood demographics
- Seasonal start times
- Pre-existing staff/customer relationships

---

## 🚀 18. Development Roadmap - AI Implementation Chunks

### Phase 1: Foundation & Core Systems (Weeks 1-2)

**Chunk 1A: Project Setup & Basic Structure**
- Set up Perchance project architecture
- Implement basic HTML structure and CSS framework
- Create core JavaScript modules (main.js, uiManager.js)
- Set up save/load system foundation
- Integrate essential Perchance plugins (AI text, image generation)

**Chunk 1B: Game State Management**
- Design and implement GameData.js structure
- Create player character creation system
- Build basic store setup flow
- Implement time system (day/week progression)
- Create fundamental UI navigation

**Chunk 1C: Basic NPC System**
- Implement name generation from curated lists
- Create archetype system and basic traits
- Build NPC data structure and storage
- Develop simple NPC encounter system
- Set up NPC registry for the work computer

---

### Phase 2: Core Gameplay Loop (Weeks 3-4)

**Chunk 2A: Customer Interaction System**
- Build conversation interface and dialogue trees
- Implement basic customer service mechanics
- Create simple checkout/transaction system
- Develop relationship tracking foundation
- Add basic customer satisfaction scoring

**Chunk 2B: Product & Inventory System**
- Design product data structure and categories
- Implement basic inventory management
- Create simple reorder system
- Build product display and pricing mechanics
- Add stock level tracking and alerts

**Chunk 2C: Basic Financial System**
- Implement cash register and transaction logging
- Create daily/weekly financial reporting
- Build debt tracking and payment system
- Add basic expense management (rent, utilities)
- Set up profit/loss calculations

---

### Phase 3: Work Computer Interface (Weeks 5-6)

**Chunk 3A: Computer UI Framework**
- Build tabbed interface for work computer
- Create app launcher and navigation system
- Implement window management and multitasking
- Design responsive computer interface styling
- Add basic computer startup/shutdown flow

**Chunk 3B: NPC Management App**
- Build detailed NPC profile viewing system
- Implement relationship level displays and tracking
- Create NPC bio editing capabilities
- Add relationship history logging
- Implement NPC search and filtering

**Chunk 3C: Product Management App**
- Create inventory overview dashboard
- Build stock level monitoring and alerts
- Implement reorder interface with AI product generation
- Add sales trend analysis and reporting
- Create product category management

---

### Phase 4: AI Content Generation (Weeks 7-8)

**Chunk 4A: NPC AI Enhancement**
- Implement background NPC enrichment system
- Create AI prompt templates for NPC backstories
- Build personality tag generation system
- Add AI-generated NPC profile pictures
- Implement dynamic NPC behavior patterns

**Chunk 4B: Product AI Generation**
- Create AI product name and description generation
- Implement product image generation system
- Build category-based product prompt templates
- Add seasonal and trending product generation
- Create product rarity and pricing algorithms

**Chunk 4C: Dialogue & Event AI**
- Implement real-time AI dialogue generation
- Create context-aware conversation prompts
- Build event and news generation system
- Add AI-generated customer complaints/compliments
- Implement dynamic scenario creation

---

### Phase 5: Staff & Automation (Weeks 9-10)

**Chunk 5A: Staff Hiring System**
- Build staff recruitment interface
- Implement job role definitions and requirements
- Create staff application and interview process
- Add background check and reference systems
- Build staff onboarding workflow

**Chunk 5B: Staff Management & Scheduling**
- Create shift scheduling interface
- Implement staff performance tracking
- Build productivity and morale systems
- Add staff drama and conflict resolution
- Create staff benefits and incentive programs

**Chunk 5C: Automation Systems**
- Implement automated customer service (cashier)
- Build automated cleaning and maintenance
- Create automated inventory restocking
- Add automated security monitoring
- Implement AI assistant manager decision-making

---

### Phase 6: Advanced Features (Weeks 11-12)

**Chunk 6A: Social Media & Bank Apps**
- Build in-game social media interface
- Implement NPC-generated posts and interactions
- Create bank account management system
- Add investment portfolio tracking
- Build credit and loan management features

**Chunk 6B: Security & Crime System**
- Implement theft detection and prevention
- Create security camera monitoring interface
- Build incident reporting and resolution
- Add alarm system and emergency responses
- Implement debt collection encounter system

**Chunk 6C: Relationship & Adult Content**
- Build romance progression tracking
- Implement adult content gating and warnings
- Create private interaction scenarios
- Add relationship consequence systems
- Build reputation and scandal mechanics

---

### Phase 7: Polish & Enhancement (Weeks 13-14)

**Chunk 7A: Advanced Economics**
- Implement supply/demand fluctuations
- Create seasonal and event-driven pricing
- Build competition and market analysis
- Add investment mini-game functionality
- Create economic trend prediction systems

**Chunk 7B: Random Events & Challenges**
- Build health inspection and regulatory systems
- Implement random crisis event generation
- Create customer problem resolution scenarios
- Add emergency situation responses
- Build community event integration

**Chunk 7C: Progression & Achievements**
- Implement tier-based progression unlocks
- Create achievement tracking and rewards
- Build store upgrade and expansion systems
- Add multiple location management
- Create endgame content and challenges

---

### Phase 8: Final Integration & Testing (Weeks 15-16)

**Chunk 8A: System Integration**
- Connect all subsystems seamlessly
- Implement cross-system data sharing
- Create unified save/load functionality
- Add comprehensive error handling
- Build system performance optimization

**Chunk 8B: User Experience Polish**
- Implement tutorial and onboarding system
- Create help documentation and tooltips
- Add accessibility features and options
- Build mobile responsiveness optimizations
- Create user preference and settings management

**Chunk 8C: Content Balancing & QA**
- Balance economic systems and progression curves
- Fine-tune AI content generation parameters
- Test all interaction combinations
- Optimize performance and load times
- Create comprehensive testing scenarios

---

## 📝 19. AI Prompt Strategy Guidelines

### For Each Chunk Development:

**Context Setup Prompts:**
```
"You are developing [Chunk Name] for a store management simulation game. 
Here's the full design document: [attach design doc]
Focus specifically on: [chunk requirements]
Use these technologies: HTML5, JavaScript, CSS3, Perchance plugins
Maintain compatibility with: [previous chunk outputs]"
```

**Implementation Prompts:**
```
"Implement [specific feature] with these requirements:
- Functional: [list core functionality]
- Technical: [list technical constraints]
- UI/UX: [describe interface needs]
- Integration: [how it connects to other systems]
- Data: [what data structures are needed]"
```

**Testing & Validation Prompts:**
```
"Create comprehensive tests for [chunk name] including:
- Unit tests for core functions
- Integration tests with existing systems
- User experience testing scenarios
- Performance benchmarks
- Edge case handling"
```

---

## 🎯 20. Chunk Dependencies & Critical Path

**Critical Path Chunks** (Must be completed in order):
1. **1A → 1B → 1C**: Foundation systems
2. **2A → 2B → 2C**: Core gameplay
3. **3A → 3B/3C**: Computer interface
4. **4A → 4B → 4C**: AI content generation

**Parallel Development Opportunities:**
- Chunks 3B and 3C can be developed simultaneously
- Chunks 4A, 4B, 4C can be parallelized after 3A
- Chunks 6A, 6B, 6C can be developed in any order
- Phase 7 chunks can be tackled based on priority

**Integration Points** (Require coordination):
- Phase 3 → Phase 4: Computer apps need AI content
- Phase 4 → Phase 5: Staff system needs AI-generated personalities
- Phase 5 → Phase 6: Automation affects all advanced features
- Phase 6 → Phase 7: Advanced features inform economic balancing

---
    generateImage = {import:text-to-image-plugin}
    generatorStats = {import:generator-stats-plugin}
    c0 = {import:unsafe-settings-1}
    c1 = {import:unsafe-settings-1}
    generateText = {import:ai-text-plugin}
    date = {import:date-plugin} 
    favicon = {import:favicon-plugin}
    iframe = {import:iframe-plugin}
    image = {import:ue91rctukj}
    commentsPlugin = {import:comments-plugin}
    url = {import:url-params-plugin}
    ai = {import:ai-text-plugin}
    fullscreenButton = {import:fullscreen-button-plugin}
    Kiera = {import:yv49wuj5d6}
    speak = {import:text-to-speech-plugin}
    literal = {import:literal-plugin}
    tabbedCommentsPlugin = {import:tabbed-comments-plugin-v1}
    combineEmojis = {import:combine-emojis-plugin}
    remember = {import:unsafe-rememberchange}
    createMediaGallery = {import:create-media-gallery-plugin}
    kv = {import:kv-plugin}
    backgroundImage = {import:background-image-plugin}