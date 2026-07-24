/**
 * Compatibility shim: maps @mui/icons-material names to FA Pro Light equivalents.
 * Accepts the same sx/style/className props as MUI icon components.
 */
import Box, { BoxProps } from '@mui/material/Box';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faXmark, faThumbsUp, faThumbsDown, faCopy, faBars, faPlus,
  faTableColumns, faCommentPlus, faArrowUp, faArrowUpRightFromSquare,
  faFolder, faStop, faMagnifyingGlass, faFileLines, faUser, faComment,
  faThumbtack, faChevronRight, faEllipsisVertical, faPen, faTrash,
  faChevronDown, faChevronUp, faCloudArrowUp, faCloudArrowDown,
  faFileArrowDown, faFileArrowUp, faListUl, faTableCells, faEllipsis,
  faFolderPlus, faEnvelope, faFile, faFolderOpen, faHardDrive,
  faInboxArrowDown, faClockRotateLeft, faHourglassEmpty, faTriangleExclamation,
  faRecycle, faUsers, faChartLine, faGear, faBell, faGauge, faComments,
  faCircleQuestion, faBoxArchive, faCodeCompare, faTable, faPenRuler,
  faDownload, faPeopleGroup, faSparkles, faLanguage, faBolt, faDroplet,
  faHand, faVectorSquare, faCirclePlus, faCircleMinus,
  faListUl as faListCheck, faClipboardList, faLayerGroup, faHouse,
  faStore, faLock, faChartBar, faFilePlus, faInbox, faCompass,
  faFileCircleCheck, faMagnifyingGlassChart, faUserPlus, faArrowDownToLine,
  faWandMagicSparkles,
} from '@fortawesome/pro-light-svg-icons';
import { faStar, faThumbtack as faThumbtackSolid, faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faMagnifyingGlass as faMagnifyingGlassSolid } from '@fortawesome/pro-solid-svg-icons';

type IconProps = BoxProps & { fontSize?: number | string };

const icon = (def: IconDefinition) =>
  ({ sx, className, style, fontSize, ...rest }: IconProps) => (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1, fontSize: fontSize ?? 'inherit', ...sx }}
      className={className}
      style={style}
    >
      <FontAwesomeIcon icon={def} style={{ width: '1em', height: '1em', fontSize: '1em' }} />
    </Box>
  );

// AssistantPanel
export const CloseRounded = icon(faXmark);
export const ThumbUpOutlined = icon(faThumbsUp);
export const ThumbDownOutlined = icon(faThumbsDown);
export const ContentCopyRounded = icon(faCopy);
export const DensityMediumRounded = icon(faBars);
export const AddRounded = icon(faPlus);
export const VerticalSplitRounded = icon(faTableColumns);
export const AddCommentRounded = icon(faCommentPlus);
export const ArrowUpwardRounded = icon(faArrowUp);
export const LaunchRounded = icon(faArrowUpRightFromSquare);
export const FolderRounded = icon(faFolder);
export const ClearRounded = icon(faXmark);
export const StopRounded = icon(faStop);
export const SearchRounded = icon(faMagnifyingGlass);
export const SearchSolid = icon(faMagnifyingGlassSolid);
export const ArticleRounded = icon(faFileLines);
export const PersonRounded = icon(faUser);
export const ChatBubbleOutlineRounded = icon(faComment);
export const PushPin = icon(faThumbtackSolid);
export const PushPinOutlined = icon(faThumbtack);
export const ChevronRight = icon(faChevronRight);
export const MoreVertRounded = icon(faEllipsisVertical);
export const EditRounded = icon(faPen);
export const DeleteRounded = icon(faTrash);

// DocumentViewer
export const OpenInNewRounded = icon(faArrowUpRightFromSquare);
export const KeyboardArrowDownRounded = icon(faChevronDown);
export const KeyboardArrowUpRounded = icon(faChevronUp);
export const FilePdfIcon = icon(faFilePdf);
export const FileWordIcon = icon(faFileWord);
export const FileExcelIcon = icon(faFileExcel);
export const FilePowerpointIcon = icon(faFilePowerpoint);
export const PanToolRounded = icon(faHand);
export const SelectionBoxRounded = icon(faVectorSquare);
export const AddCircleOutlineRounded = icon(faCirclePlus);
export const RemoveCircleOutlineRounded = icon(faCircleMinus);

// FolderTable
export const CloudUpload = icon(faCloudArrowUp);
export const FileDownloadRounded = icon(faFileArrowDown);
export const ExpandMoreRounded = icon(faChevronDown);
export const FormatListBulletedRounded = icon(faListUl);
export const ViewColumnRounded = icon(faTableColumns);
export const MoreHorizRounded = icon(faEllipsis);
export const CreateNewFolderRounded = icon(faFolderPlus);
export const StarRounded = icon(faStar);
export const StarOutlineRounded = icon(faStar);
export const MailOutlineRounded = icon(faEnvelope);
export const InsertDriveFileRounded = icon(faFile);
export const InsertDriveFileOutlined = icon(faFile);

// FolderTreePanel
export const FolderOpenRounded = icon(faFolderOpen);
export const ExpandMore = icon(faChevronDown);
export const StorageRounded = icon(faHardDrive);
export const MoveToInboxRounded = icon(faInboxArrowDown);
export const StarBorderRounded = icon(faStar);
export const PendingOutlined = icon(faHourglassEmpty);
export const WarningAmberRounded = icon(faTriangleExclamation);
export const CloudDownloadOutlined = icon(faCloudArrowDown);
export const RecyclingRounded = icon(faRecycle);

// Sidebar
export const GridViewRounded = icon(faTableCells);
export const QuestionAnswerRounded = icon(faComments);
export const GroupRounded = icon(faUsers);
export const ShowChartRounded = icon(faChartLine);
export const DescriptionRounded = icon(faFileLines);
export const SettingsRounded = icon(faGear);
export const HistoryRounded = icon(faClockRotateLeft);
export const NotificationsNoneRounded = icon(faBell);

// SpotlightSearch
export const LayersRounded = icon(faLayerGroup);
export const HomeRounded = icon(faHouse);
export const StorefrontRounded = icon(faStore);
export const DashboardRounded = icon(faGauge);
export const QuizRounded = icon(faCircleQuestion);
export const LockRounded = icon(faLock);
export const ArchiveRounded = icon(faBoxArchive);
export const InventoryRounded = icon(faClipboardList);
export const AssessmentRounded = icon(faChartBar);
export const NoteAddRounded = icon(faFilePlus);
export const InboxRounded = icon(faInbox);
export const DownloadRounded = icon(faDownload);
export const GroupsRounded = icon(faPeopleGroup);
export const AutoAwesomeRounded = icon(faWandMagicSparkles);
export const GTranslateRounded = icon(faLanguage);
export const FlashOnRounded = icon(faBolt);
export const OpacityRounded = icon(faDroplet);
export const SummarizeRounded = icon(faFileLines);
export const CompareRounded = icon(faCodeCompare);
export const TableChartRounded = icon(faTable);
export const DrawRounded = icon(faPenRuler);
export const FileUploadRounded = icon(faFileArrowUp);
export const PersonAddRounded = icon(faUserPlus);
export const GroupAddRounded = icon(faUserPlus);
export const ManageSearchRounded = icon(faMagnifyingGlassChart);
export const ListRounded = icon(faListUl);
export const ExploreRounded = icon(faCompass);
export const RestorePageRounded = icon(faFileCircleCheck);
