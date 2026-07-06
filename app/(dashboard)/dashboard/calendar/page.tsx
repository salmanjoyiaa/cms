import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCalendarEvents } from '@/lib/actions/publishing';

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    const date = event.scheduled_at?.split('T')[0] ?? 'unscheduled';
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Content Calendar" description="View scheduled publishing across all platforms." />

      {Object.keys(grouped).length === 0 ? (
        <Card className="glass-card p-12 text-center text-muted-foreground">
          No scheduled content. Schedule items from the publishing queue.
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([date, dayEvents]) => (
            <Card key={date} className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">
                  {date === 'unscheduled' ? 'Unscheduled' : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-sm">{(event.content_projects as { title?: string })?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.scheduled_at && new Date(event.scheduled_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{event.platform}</Badge>
                      <Badge variant="secondary">{event.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
