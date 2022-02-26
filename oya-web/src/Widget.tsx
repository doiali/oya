import { Card, CardContent, CardHeader, CardProps, Divider, styled, SxProps, Theme } from '@mui/material';
import { forwardRef, ReactNode } from 'react';

type WidgetProps = {
  children?: ReactNode,
  title?: ReactNode,
  sx?: SxProps<Theme>,
  cardProps?: CardProps,
};

const StyledCard = styled(Card)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  ['& .MuiCardHeader-root, & .MuiCardContent-root']: {
    padding: theme.spacing(4, 2),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4, 3),
    },
  },
}));

export default forwardRef<HTMLDivElement, WidgetProps>(function Widget(props, ref) {
  const { children, title, sx, cardProps } = props;
  return (
    <StyledCard {...(cardProps ?? {})} sx={sx} ref={ref}>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        {children}
      </CardContent>
    </StyledCard>
  );
});
