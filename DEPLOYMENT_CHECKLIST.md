# Deployment Checklist

Use this checklist to ensure your Price Compare app is fully functional before going to production.

## Pre-Deployment

### Local Development
- [ ] App runs successfully with `npm run dev`
- [ ] All environment variables are set in `.env.local`
- [ ] Database migrations have been run
- [ ] At least one admin user exists
- [ ] Sample data has been added

### Code Quality
- [ ] No console errors in browser
- [ ] No TypeScript errors: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] All pages load without errors

### Features Testing
- [ ] Authentication flow works (signup, signin, signout)
- [ ] Password reset works
- [ ] Price list displays correctly
- [ ] Dashboard shows user's alerts
- [ ] Admin panel is accessible to admin users only
- [ ] CRUD operations work for goods, stores, and prices
- [ ] Price alerts can be created and managed
- [ ] Email notifications are sent (test with Resend)

## Supabase Production Setup

### Database
- [ ] All migrations applied successfully
- [ ] Row Level Security policies are active
- [ ] At least one admin user configured
- [ ] Sample/production data loaded

### Authentication
- [ ] Email confirmation enabled (optional)
- [ ] Password requirements configured
- [ ] Site URL set correctly
- [ ] Redirect URLs include production domain

### API
- [ ] Service role key is kept secret
- [ ] Anon key is being used client-side
- [ ] API rate limits reviewed

## Resend Production Setup

### Email Configuration
- [ ] Custom domain verified (or using Resend test domain)
- [ ] RESEND_FROM_EMAIL uses verified domain
- [ ] Email templates render correctly
- [ ] Test emails sent successfully
- [ ] SPF/DKIM records configured (for custom domain)

### Email Testing
- [ ] Price alert emails send correctly
- [ ] Emails render properly in major clients (Gmail, Outlook)
- [ ] Unsubscribe link works (if implemented)
- [ ] Email contains correct app URL

## Vercel Deployment

### Repository
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `.gitignore` includes `.env.local`
- [ ] README.md is up to date

### Vercel Project
- [ ] Project imported from repository
- [ ] Framework preset: Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `RESEND_API_KEY` set
- [ ] `RESEND_FROM_EMAIL` set
- [ ] `NEXT_PUBLIC_APP_URL` set to Vercel domain
- [ ] All variables match production credentials

### Domain Configuration
- [ ] Custom domain added (optional)
- [ ] SSL certificate active
- [ ] DNS records configured correctly

## Post-Deployment Verification

### Functionality
- [ ] Production site loads at correct URL
- [ ] Authentication works on production
- [ ] Users can sign up/sign in
- [ ] Password reset works
- [ ] Price list displays
- [ ] Dashboard accessible after login
- [ ] Admin panel accessible to admin users
- [ ] Emails send from production

### Performance
- [ ] Lighthouse score > 90 (run in Chrome DevTools)
- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No console errors in production

### Security
- [ ] HTTPS enforced
- [ ] Environment variables not exposed in client
- [ ] API endpoints require authentication where needed
- [ ] RLS policies enforced in Supabase
- [ ] Admin routes protected

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking setup (optional: Sentry)
- [ ] Supabase database metrics reviewed
- [ ] Email delivery monitored in Resend

## Production Data Setup

### Initial Data
- [ ] Countries table populated
- [ ] Currencies table populated
- [ ] Initial stores added
- [ ] Sample goods/products added
- [ ] Recent prices added
- [ ] Admin user(s) configured

### Data Quality
- [ ] No test/dummy data in production
- [ ] All required fields populated
- [ ] Prices are current and accurate
- [ ] Store information is complete

## User Communication

### Documentation
- [ ] Help documentation available (if applicable)
- [ ] Privacy policy posted
- [ ] Terms of service posted (if applicable)
- [ ] Contact information available

### User Onboarding
- [ ] Welcome email template ready
- [ ] User guide available (link to README/QUICKSTART)
- [ ] FAQ section prepared (if applicable)

## Final Checks

### Legal & Compliance
- [ ] Privacy policy reviewed
- [ ] GDPR compliance checked (if EU users)
- [ ] Data retention policies defined
- [ ] User data export capability (if required)

### Backup & Recovery
- [ ] Supabase automatic backups enabled
- [ ] Database backup schedule reviewed
- [ ] Recovery procedure documented
- [ ] Emergency contact list prepared

### Performance Optimization
- [ ] Images using Next.js Image component
- [ ] Fonts optimized
- [ ] Unnecessary dependencies removed
- [ ] Bundle size analyzed

## Maintenance Plan

### Regular Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check email delivery rates
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review database performance
- [ ] Quarterly: Security audit
- [ ] Quarterly: User feedback review

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error alerts
- [ ] Monitor database size
- [ ] Track API usage

## Emergency Procedures

### Rollback Plan
- [ ] Previous deployment preserved in Vercel
- [ ] Database rollback procedure documented
- [ ] Emergency contacts listed

### Incident Response
- [ ] Downtime notification plan
- [ ] User communication template
- [ ] Recovery time objective defined

---

## Sign-off

- [ ] Technical lead reviewed
- [ ] Stakeholder approved
- [ ] Launch date confirmed
- [ ] Support team briefed

**Deployment Date**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Notes**:
_________________________________
_________________________________
_________________________________

---

## Post-Launch (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check email delivery
- [ ] Verify user signups working
- [ ] Review performance metrics
- [ ] Collect initial user feedback

## Post-Launch (First Week)

- [ ] Address any critical bugs
- [ ] Optimize based on real usage data
- [ ] Collect and review user feedback
- [ ] Plan first feature update

---

Good luck with your launch! 🚀
