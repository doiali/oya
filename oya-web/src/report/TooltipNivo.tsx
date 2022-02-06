import { alpha, Paper, Stack, styled, Typography } from '@mui/material';
import { ComputedDatum } from '@nivo/sunburst';
import { getDeltaStringOfRange as ts } from '../utils';
import { TreeDataNivo } from './chartUtils';
import { useReportContext } from './ReportProvider';

const TooltipWrapper = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  padding: theme.spacing(2),
}));

export default function TooltipNivo(
  props: ComputedDatum<TreeDataNivo> & { isTop?: boolean; isLeft?: boolean; },
) {
  const { data, percentage, id, isTop } = props;
  const { activity, prefix } = data;
  const { atrm } = useReportContext();
  if (!activity) return <TooltipWrapper>{id}: {percentage}%</TooltipWrapper>;
  const renderRow = (name: string, value: string | number) => (
    <Typography variant='body2' textAlign="center" key={name}>
      {name}: <b>{value}</b>
    </Typography>
  );
  const r = atrm[activity.id];
  if (!r) return <TooltipWrapper>{id}: {percentage}%</TooltipWrapper>;

  return (
    <TooltipWrapper style={{
      transform: (
        `translate(0, ${isTop ? 'calc(100% + 32px)' : 0})`
      ),
    }}
    >
      <Typography gutterBottom variant='h6' textAlign="center">
        {activity.name}: <b>{percentage.toFixed(2)}%</b>
      </Typography>
      <Stack>
        {renderRow('days', `${r.days} of ${r.allDays}`)}
        {renderRow('total time', ts(r.time))}
        {renderRow('avg per all days', ts(r.avgPerAllDays))}
        {renderRow('avg per days', ts(r.avgPerDays))}
        {renderRow('occurance', r.occurance.toString())}
        {prefix && (
          <Typography variant='body2' textAlign="center">
            {prefix}
          </Typography>
        )}
      </Stack>
    </TooltipWrapper>
  );
}
