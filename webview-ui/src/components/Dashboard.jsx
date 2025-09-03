import React from 'react';
import { Card } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';

export default function Dashboard({ submissions, formStyle, computeCompletionRate }) {
  if (!submissions.length) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(30px)',
        borderRadius: '20px',
        margin: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.3)',
        position: 'relative'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #000000ff 0%, #ffffffff 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '32px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
        }}>
          📊
        </div>
        <h4 style={{
          color: '#334155',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px',
          fontFamily: '"Inter", -apple-system, sans-serif',
          letterSpacing: '-0.02em'
        }}>
          No Data Yet
        </h4>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Form submissions will appear here once you start collecting responses
        </p>
      </div>
    );
  }

  const data = submissions.map((s, i) => ({
    name: new Date(s.timestamp).toLocaleDateString(),
    count: i + 1,
    date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const completionRate = computeCompletionRate();
  const totalSubmissions = submissions.length;
  const recentSubmissions = submissions.filter(s => 
    new Date(s.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontFamily: '"Inter", -apple-system, sans-serif'
        }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#334155' }}>{`Date: ${label}`}</p>
          <p style={{ margin: 0, color: formStyle?.primaryColor || '#000000ff' }}>
            {`Total Submissions: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      margin: '16px',
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
    }}>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gridColumn: '1 / -1'
      }}>
        {/* Total Submissions Card */}
        <Card style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          <Card.Body style={{ padding: '24px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #000000ff 0%, #ffffffff 100%)',
              borderRadius: '50%',
              opacity: 0.1
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #000000ff 0%, #ffffffff 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '16px',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                📝
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {totalSubmissions}
              </h3>
              <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '4px'
              }}>
                Total Submissions
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Completion Rate Card */}
        <Card style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          <Card.Body style={{ padding: '24px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '50%',
              opacity: 0.1
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '16px',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }}>
                ✅
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {completionRate}%
              </h3>
              <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '4px'
              }}>
                Completion Rate
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Recent Submissions Card */}
        <Card style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          <Card.Body style={{ padding: '24px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '50%',
              opacity: 0.1
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '16px',
                boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
              }}>
                🔥
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '800',
                margin: 0,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {recentSubmissions}
              </h3>
              <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '4px'
              }}>
                Last 7 Days
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Chart Card */}
      <Card style={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.3)',
        overflow: 'hidden',
        gridColumn: '1 / -1'
      }}>
        <Card.Body style={{ padding: '32px' }}>
          {/* Header with gradient */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #000000ff 0%, #7c7c7cff 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            }}>
              📊
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #000000ff 0%, #b1aeaeff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '"Inter", -apple-system, sans-serif',
                letterSpacing: '-0.02em'
              }}>
                Submission Trends
              </h4>
              <p style={{
                margin: 0,
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Track your form performance over time
              </p>
            </div>
          </div>

          {/* Enhanced Chart Container */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={formStyle?.primaryColor || '#667eea'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={formStyle?.primaryColor || '#667eea'} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontFamily: '"Inter", -apple-system, sans-serif' }}
                  style={{ fontWeight: '500' }}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontFamily: '"Inter", -apple-system, sans-serif' }}
                  style={{ fontWeight: '500' }}
                />
                <Tooltip content={customTooltip} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={formStyle?.primaryColor || '#667eea'}
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={{
                    fill: formStyle?.primaryColor || '#667eea',
                    strokeWidth: 2,
                    stroke: '#fff',
                    r: 6
                  }}
                  activeDot={{
                    r: 8,
                    fill: formStyle?.primaryColor || '#667eea',
                    stroke: '#fff',
                    strokeWidth: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Footer Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: formStyle?.primaryColor || '#667eea',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {totalSubmissions}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '4px'
              }}>
                Total Submissions
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#10b981',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {completionRate}%
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '4px'
              }}>
                Completion Rate
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#f59e0b',
                fontFamily: '"Inter", -apple-system, sans-serif'
              }}>
                {recentSubmissions}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '4px'
              }}>
                Recent (7d)
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}             